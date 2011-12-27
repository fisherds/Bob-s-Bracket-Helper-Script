goog.provide('bracketHelper.SelectUpdater');

goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.array');
goog.require('goog.ui.Button');
goog.require('goog.ui.Component');
goog.require('goog.ui.Component.EventType');
goog.require('goog.ui.Component.State');

goog.require('bracketHelper.Game');

/**
* @fileoverview Controller for all the tournament games and buttons
*/

/**
* Updates the select elements as tournament selections are made.
* @constructor
*/
bracketHelper.SelectUpdater = function() {		
	/**
	* All of the select elements in order from the first to final round
	* @type {!Array.<Element>}
	* @private
	*/
	this.games_ = [];
	
	this.init_();
};

/**
* Initalize the array of Games.  Setup listeners for the buttons and the tournament updates.
* @private
*/
bracketHelper.SelectUpdater.prototype.init_ = function() {
	// Prepare the select elements
	var selectElements = goog.dom.getElementsByTagNameAndClass('select');
	selectElementsMutableCopy = goog.array.clone(selectElements);
	goog.array.sort(selectElementsMutableCopy, bracketHelper.SelectUpdater.compareSelectElements);
	goog.array.insertAt(selectElementsMutableCopy, null, 0);

	// Start adding Games to the array.  The structure is setup as a standard binary tree stored in an array.
	// [null, root, leftChild of i/2, rightChild of (i-1)/2, leftChild of i/2, rightChild of (i-1)/2, ...]
	goog.array.insert(this.games_, null);
	var finalGame = new bracketHelper.Game(selectElementsMutableCopy[1], null);
	
	goog.array.insert(this.games_, finalGame);
	for (var i=2; i<selectElementsMutableCopy.length; i++) {
		goog.array.insert(this.games_, new bracketHelper.Game(selectElementsMutableCopy[i], this.games_[parseInt(i/2)]));
	}
	
	// Grab the last two input elements and assume they are the submit and reset buttons
//	var inputElements = goog.dom.getElementsByTagNameAndClass('input');
//	var submitButtonElement = inputElements(inputElements.length-2);
//	var resetButtonElement = inputElements(inputElements.length-1);
	
	var submitButtonElement = goog.dom.getElement('submit_button');
	var resetButtonElement = goog.dom.getElement('clear_button');
	
	
	// Create a goog.ui.Button control for the Submit Bracket button element
	var submitButton = new goog.ui.Button(null /* content */);
	submitButton.decorate(submitButtonElement);
	submitButton.setTooltip('You need to fill out all the games');
	submitButton.setEnabled(false);
	goog.events.listen(submitButton, goog.ui.Component.EventType.ACTION, function(e) {
		// Nothing to do on Action, but a handy place holder.
	}, false, this);
	
	// Create a goog.ui.Button control for the Clear Bracket button element
	var resetButton = new goog.ui.Button(null /* content */);
	resetButton.decorate(resetButtonElement);
	resetButton.setTooltip('Warning cannot be undone.');
	goog.events.listen(resetButton, goog.ui.Component.EventType.ACTION, function(e) {
		for (var i=1; i<this.games_.length; i++) {
			this.games_[i].resetGame();
		}
		this.updateSelectElementClass();
	}, false, this);
	
	// Listen for tournament updates
	goog.events.listen(finalGame, bracketHelper.Game.EventType.TOURNAMENT_UPDATED, function(e) {
		// Count the remaining games that are marked as NONE and update the UI as appropriate
		var remainingGames = this.countRemainingNones();
		submitButton.setEnabled(false);
		if (remainingGames == 0) {
			submitButton.setEnabled(true);
		}
		this.updateSelectElementClass();
		submitButton.setTooltip("" + remainingGames + " games still need to be selected.");
	}, false, this);
	
	this.updateSelectElementClass();
};

/**
* Helper to count the number of games still marked as NONE.
* @private
*/
bracketHelper.SelectUpdater.prototype.countRemainingNones = function() {
	var nonesRemaining = 0;
	for (var i=1; i<this.games_.length; i++) {
		if (this.games_[i].getSelectElement().options.selectedIndex == 0) {
			nonesRemaining += 1;
		}	
	}
	return nonesRemaining;
};

/** Compare two games for the purpose of sorting. */
bracketHelper.SelectUpdater.compareSelectElements = function(selectElement1, selectElement2) {
	if (selectElement1.name < selectElement2.name) {
		return 1;
	} else if (selectElement1.name > selectElement2.name) {
		return -1;
	} else {
		return 0;
	}
};

/** Compare two games for the purpose of sorting. */
bracketHelper.SelectUpdater.prototype.updateSelectElementClass = function() {
	for (var i=1; i<this.games_.length; i++) {
		if (this.games_[i].getSelectElement().options.selectedIndex == 0) {
			//this.games_[i].getSelectElement().style.background = 'yellow';
			goog.dom.classes.set(this.games_[i].getSelectElement(), "game-none");
		} else {
			//this.games_[i].getSelectElement().style.background = '';
			goog.dom.classes.set(this.games_[i].getSelectElement(), "game-completed");
		}
	}
};

window.onload = function() {
	new bracketHelper.SelectUpdater();
};