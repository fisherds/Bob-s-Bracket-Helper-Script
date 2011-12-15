goog.provide('bracketHelper.Game');

goog.require('goog.array');
goog.require('goog.events');
goog.require('goog.events.EventTarget');

/**
* @fileoverview Represents a game in the tournament.  Provides convenient methods to
* update the view, query for state, and link to games before and after.
*/

/**
* Represents a game in the tournament with a link to the view object (select element).
* @constructor
* @extends {goog.events.EventTarget}
*/
bracketHelper.Game = function(element, nextGame) {
	goog.events.EventTarget.call(this);
	
	/**
	* Select element that displays this game.  This holds some data for the game:
	*  - Holds all the options (ie names of teams that might win)
	*  - Holds the current winner via an index to an option (NONE=0)
	* @type {Element}
	* @private
	*/
	this.selectElement_ = element;

	/**
	* List of all the team names that might reach this game.
	* @type {!Array.<string>}
	* @private
	*/
	this.allOptions_ = [];

	/**
	* Link to the two prior games that fed into this game.
	* @type {Array.<bracketHelper.Game>}
	* @private
	*/
	this.priorGames_ = [];

	/**
	* Winning this game would put you into the next game.
	* @type {bracketHelper.Game}
	* @private
	*/
	this.nextGame_ = nextGame;
	
	if (element) {
		this.init_();
	}
};
goog.inherits(bracketHelper.Game, goog.events.EventTarget);

/**
* Continues the constructor to initial this Game
* @private
*/
bracketHelper.Game.prototype.init_ = function() {
	
	for(var i = 1; i<this.selectElement_.options.length; i++) {
		this.allOptions_.push(this.selectElement_.options[i].value);
	}
	
	// Attach a listener for the game being updated
	this.selectElement_.onchange = goog.bind(this.winnerSelectedByUser, this);
	if (this.nextGame_) {
		this.nextGame_.addChild(this);
	}
};

/**
* @param priorGame 
*/
bracketHelper.Game.prototype.addChild = function(priorGame) {
	this.priorGames_.push(priorGame);
};


/**
* Resets the game to the original list of names.
* Calls when a user clicks 'Clear Bracket'
*/
bracketHelper.Game.prototype.resetGame = function() {
	this.selectElement_.options.selectedIndex = 0;
	this.setOptionsWithNames(this.allOptions_);
};

/**
* Helper function used to load options
* Do not pass in NONE.  That one will be assumed!
* @private
*/
bracketHelper.Game.prototype.setOptionsWithNames = function(names) {
	// Remove all options and just make new options
	// CONSIDER: Could be done more efficiently by not necessary.
	this.selectElement_.options.length=0;
	this.selectElement_.options[0] = new Option("NONE", "NONE", false, false);
	for (var i = 0; i<names.length; i++) {
		this.selectElement_.options[i+1] = new Option(names[i], names[i], false, false);
	}
};

bracketHelper.Game.prototype.toString = function(names) {
	return "Name: " + this.selectElement_.name + "(" + this.selectElement_.options.length + ")";
};

/** 
* Selects the given name from the list of options. 
* This can be necessary when back filling a winner.
* Note, this is not needed when the user selects a name.
*/
bracketHelper.Game.prototype.updateElementWithName = function(aName) {
	// var indexOfName = selectElement.options.namedItem(aName); // Didn't work at all.
	
	// CONSIDER: Could use goog.array.findIndex
	var indexOfName;
	for(indexOfName = 0; indexOfName < this.selectElement_.options.length; indexOfName++){
		if (this.selectElement_.options[indexOfName].text == aName) {
			break;
		}
	}
	if (indexOfName == this.selectElement_.options.length) {
		console.log("Name: " + aName + " not found in " + this.selectElement_.name);
		for(var i = 0; i < this.selectElement_.options.length; i++){
			console.log("   Option #" + i+ " was " + this.selectElement_.options[i].text);
		}
		// The winner selected is not in the list.  Reset the selection to NONE.
		indexOfName = 0;
	}
	this.selectElement_.options.selectedIndex = indexOfName;
};

/*
* Returns an array of who might advance from this round.
* @return <Array.<string>}
*/
bracketHelper.Game.prototype.whoMightAdvance = function() {
	// Check if there is a winner selected other than NONE
	var mightWin = [];
	var winnerIndex = this.selectElement_.options.selectedIndex;
	if (winnerIndex == 0) {
		// if NONE is selected return an array of all options
		for (var i=1; i<this.selectElement_.options.length; i++) {
			mightWin.push(this.selectElement_.options[i].text);
		}
	} else {
		// if a winner is selected return just the winner
		mightWin.push(this.selectElement_.options[winnerIndex].text);
	}
	return mightWin;
};

/*
* Updates this select element and continues the propogation forward.
* This is called when a winner is marked in a prior game.
* Note this function is NOT called in the game the user made a selection, just future games.
*/
bracketHelper.Game.prototype.updateOptions = function() {
	// Save the info for the current round champion
	//console.log("Update Options for " + this.selectElement_.name);
	var winnerIndex = this.selectElement_.options.selectedIndex;
	var winnerName = this.selectElement_.options[winnerIndex].text;
	var mightAdvance = [];
	// Look at my prior games for who might advance
	for(var i=this.priorGames_.length-1; i>=0; i--) {
		// mightAdvance = mightAdvance.concat( this.priorGames_[i].whoMightAdvance() );
		mightAdvance = goog.array.concat(mightAdvance, this.priorGames_[i].whoMightAdvance())
	}
	// call function to set options with these names
	this.setOptionsWithNames(mightAdvance);
	// Make sure the current winner is still in those options (set to NONE if not present)-Real concern
	this.updateElementWithName(winnerName);
	// call function to update next game
	this.updateNextGame();
};

/*
* Callback for when a user selects a name for this select element.
*/
bracketHelper.Game.prototype.winnerSelectedByUser = function(aName) {
	//console.log("winnerSelectedByUser was called.")
	this.updateNextGame();
};

/*
* Updates the next game (if not the final game).
* @private
*/
bracketHelper.Game.prototype.updateNextGame = function() {
// If we are not the final game tell the next game to update.
	if (this.nextGame_) {
		this.nextGame_.updateOptions();
	} else {
		// Fire a notification to check for a complete tournament
		this.dispatchEvent(bracketHelper.Game.EventType.TOURNAMENT_UPDATED);
	}
};

/** @enum {string} */
bracketHelper.Game.EventType = {
	TOURNAMENT_UPDATED: goog.events.getUniqueId('tournament_updated')
};

/*----------------------------------------------------------------
* Getters / Setters that could be omitted
*-----------------------------------------------------------------*/

/*
* Get the select element for this Game.
* @return {Element}
*/
bracketHelper.Game.prototype.getSelectElement = function() {
	return this.selectElement_;
};

/*
* Get the parent (ie next Game in the tournament)
* @return {bracketHelper.Game}
*/
bracketHelper.Game.prototype.getNextGame = function() {
	return this.nextGame_;
};

/*
* Get the prior games in the tournament that fed into this one.
* @return {Array.<bracketHelper.Game>}
*/
bracketHelper.Game.prototype.getPriorGames = function() {
	return this.priorGames_;
};