/**
* @fileoverview Unit tests for the bracketHelperGame.js bracketHelper.Game class
*/

/** Objects under test. */
var rootGame;
var priorGame1;
var priorGame2;

function setUp() {
    var selectElementRoot = goog.dom.createDom('select');
	selectElementRoot.name = "entry127";
	selectElementRoot.options.length = 5;
	selectElementRoot.options[0] = new Option("NONE", "NONE", false, false);
	selectElementRoot.options[1] = new Option("team1", "team1", false, false);
	selectElementRoot.options[2] = new Option("team2", "team2", false, false);
	selectElementRoot.options[3] = new Option("team3", "team3", false, false);
	selectElementRoot.options[4] = new Option("team4", "team4", false, false);
	var selectElement1 = goog.dom.createDom('select');
    selectElement1.name = "entry125";
	selectElement1.options.length = 3;
	selectElement1.options[0] = new Option("NONE", "NONE", false, false);
	selectElement1.options[1] = new Option("team1", "team1", false, false);
	selectElement1.options[2] = new Option("team4", "team4", false, false);
	var selectElement2 = goog.dom.createDom('select');
	selectElement2.name = "entry126";
	selectElement2.options.length = 3;
	selectElement2.options[0] = new Option("NONE", "NONE", false, false);
	selectElement2.options[1] = new Option("team2", "team2", false, false);
	selectElement2.options[2] = new Option("team3", "team3", false, false);
    rootGame = new bracketHelper.Game(selectElementRoot, null);
    priorGame1 = new bracketHelper.Game(selectElement1, rootGame);
    priorGame2 = new bracketHelper.Game(selectElement2, rootGame);
}

function testInit() {
	assertEquals(5, rootGame.getSelectElement().options.length);
	assertEquals(3, priorGame1.getSelectElement().options.length);
	assertEquals(priorGame1.getNextGame(), rootGame);
	assertEquals(rootGame.getPriorGames().length, 2);
	assertContains(priorGame1, rootGame.getPriorGames());
	assertContains(priorGame2, rootGame.getPriorGames());
}

function testResetGame() {
	var selectElement = rootGame.getSelectElement();
	selectElement.options.selectedIndex = 2;
	selectElement.options[5] = new Option("aName", "aName", false, false);
    assertEquals(6, selectElement.options.length);
	assertEquals(2, selectElement.options.selectedIndex);
    rootGame.resetGame();
	assertEquals(5, rootGame.getSelectElement().options.length);
	assertEquals(0, rootGame.getSelectElement().options.selectedIndex);
	optionsContainText("NONE", rootGame.getSelectElement().options);
	optionsContainText("team1", rootGame.getSelectElement().options);
	optionsContainText("team2", rootGame.getSelectElement().options);
	optionsContainText("team3", rootGame.getSelectElement().options);
	optionsContainText("team4", rootGame.getSelectElement().options);
}

function testSetOptionsWithNames() {
	// Create an array of names and make sure the options get set to those names
	// 2 teams
	var twoTeams = ['team1', 'team2'];
	rootGame.setOptionsWithNames(twoTeams);
	assertEquals(3, rootGame.getSelectElement().options.length);
	optionsContainText("NONE", rootGame.getSelectElement().options);
	optionsContainText("team1", rootGame.getSelectElement().options);
	optionsContainText("team2", rootGame.getSelectElement().options);
	// 5 teams
	var fiveTeams = ['team3', 'team4', 'team5', 'team6', 'team7'];
	priorGame2.setOptionsWithNames(fiveTeams);
	assertEquals(6, priorGame2.getSelectElement().options.length);
	optionsContainText("NONE", priorGame2.getSelectElement().options);
	optionsContainText("team3", priorGame2.getSelectElement().options);
	optionsContainText("team4", priorGame2.getSelectElement().options);
	optionsContainText("team5", priorGame2.getSelectElement().options);
	optionsContainText("team6", priorGame2.getSelectElement().options);
	optionsContainText("team7", priorGame2.getSelectElement().options);
	// 0 teams
	var noTeams = [];  // Won't happen, but still going to test it
	priorGame2.setOptionsWithNames(noTeams);
	assertEquals(1, priorGame2.getSelectElement().options.length);
	optionsContainText("NONE", priorGame2.getSelectElement().options);
}

function testUpdateElementWithName() {
	assertEquals(0, rootGame.getSelectElement().options.selectedIndex);
	rootGame.updateElementWithName('team2')
	assertEquals(2, rootGame.getSelectElement().options.selectedIndex);
	
	rootGame.getSelectElement().options.length = 3;
	assertEquals(3, rootGame.getSelectElement().options.length);
	rootGame.updateElementWithName('someNameThatIsNotInTheList');
	// Note: I decided that this method should never change the options.
	// If the requested name is not in the list just make game as NONE.
	assertEquals(3, rootGame.getSelectElement().options.length);
	assertEquals(0, rootGame.getSelectElement().options.selectedIndex);
	
	rootGame.updateElementWithName('NONE')
	assertEquals(0, rootGame.getSelectElement().options.selectedIndex);
}

function testWhoMightAdvance() {
	var game1MightAdvance = priorGame1.whoMightAdvance();
	assertEquals(2, game1MightAdvance.length);
	assertContains('team1', game1MightAdvance);
	assertContains('team4', game1MightAdvance);
	priorGame2.updateElementWithName('team2');  // Removes team3 from the bracket
	var game2MightAdvance = priorGame2.whoMightAdvance();
	assertEquals(1, game2MightAdvance.length);
	assertEquals('team2', game2MightAdvance[0]);
}

function testUpdateOptionsNoEliminations() {
	assertEquals(5, rootGame.getSelectElement().options.length);
	rootGame.updateOptions();
	assertEquals(5, rootGame.getSelectElement().options.length);
	optionsContainText("NONE", rootGame.getSelectElement().options);
	optionsContainText("team2", rootGame.getSelectElement().options);
	optionsContainText("team3", rootGame.getSelectElement().options);
	optionsContainText("team1", rootGame.getSelectElement().options);
	optionsContainText("team4", rootGame.getSelectElement().options);
}

function testUpdateOptionsOneElimination() {
	priorGame2.updateElementWithName('team2');  // Removes team3 from the bracket
	assertEquals(5, rootGame.getSelectElement().options.length);
	rootGame.updateOptions();
	assertEquals(4, rootGame.getSelectElement().options.length);
	optionsContainText("NONE", rootGame.getSelectElement().options);
	optionsContainText("team2", rootGame.getSelectElement().options);
	optionsContainText("team1", rootGame.getSelectElement().options);
	optionsContainText("team4", rootGame.getSelectElement().options);
}

function testUpdateOptionsChangeToLoseWinner() {
	priorGame1.updateElementWithName('team1');  // Removes team4 from the bracket
	
	rootGame.updateOptions();
	assertEquals(4, rootGame.getSelectElement().options.length);
	optionsContainText("NONE", rootGame.getSelectElement().options);
	optionsContainText("team1", rootGame.getSelectElement().options);
	optionsContainText("team2", rootGame.getSelectElement().options);
	optionsContainText("team3", rootGame.getSelectElement().options);
	
	priorGame2.updateElementWithName('team3');  // Removes team2 from the bracket
	
	rootGame.updateOptions();
	assertEquals(3, rootGame.getSelectElement().options.length);
	optionsContainText("NONE", rootGame.getSelectElement().options);
	optionsContainText("team1", rootGame.getSelectElement().options);
	optionsContainText("team3", rootGame.getSelectElement().options);
	
	rootGame.updateElementWithName('team3');  // Winner choosen!  
	assertEquals(3, rootGame.getSelectElement().options.length);
	assertEquals(2, rootGame.getSelectElement().options.selectedIndex);
	
	// But wait... I changed my mind in an early round
	priorGame2.updateElementWithName('team2');  // Removes team3 from the bracket
	rootGame.updateOptions();
	assertEquals(3, rootGame.getSelectElement().options.length);
	assertEquals(0, rootGame.getSelectElement().options.selectedIndex);
	optionsContainText("NONE", rootGame.getSelectElement().options);
	optionsContainText("team1", rootGame.getSelectElement().options);
	optionsContainText("team2", rootGame.getSelectElement().options);	
}

function testUpdateOptionsChangeToLoseWinner() {
	
	priorGame1.updateElementWithName('team1');  // Removes team4 from the bracket
	
	rootGame.updateOptions();
	assertEquals(4, rootGame.getSelectElement().options.length);
	optionsContainText("NONE", rootGame.getSelectElement().options);
	optionsContainText("team1", rootGame.getSelectElement().options);
	optionsContainText("team2", rootGame.getSelectElement().options);
	optionsContainText("team3", rootGame.getSelectElement().options);
	
	priorGame2.updateElementWithName('team3');  // Removes team2 from the bracket
	
	rootGame.updateOptions();
	assertEquals(3, rootGame.getSelectElement().options.length);
	optionsContainText("NONE", rootGame.getSelectElement().options);
	optionsContainText("team3", rootGame.getSelectElement().options);
	optionsContainText("team1", rootGame.getSelectElement().options);
	
	rootGame.updateElementWithName('team3');  // Winner choosen!  
	assertEquals(3, rootGame.getSelectElement().options.length);
	assertEquals(1, rootGame.getSelectElement().options.selectedIndex);
	
	// But wait... I changed my mind in an early round
	priorGame2.updateElementWithName('team2');  // Removes team3 from the bracket
	rootGame.updateOptions();
	assertEquals(3, rootGame.getSelectElement().options.length);
	assertEquals(0, rootGame.getSelectElement().options.selectedIndex);
	optionsContainText("NONE", rootGame.getSelectElement().options);
	optionsContainText("team2", rootGame.getSelectElement().options);
	optionsContainText("team1", rootGame.getSelectElement().options);	
}

// TODO: Test that the callback is really happening! Not tested at present.
function testWinnerSelectedByUser() {
	priorGame2.updateElementWithName('team2');
	priorGame2.winnerSelectedByUser();
	assertEquals(4, rootGame.getSelectElement().options.length);
	optionsContainText("NONE", rootGame.getSelectElement().options);
	optionsContainText("team2", rootGame.getSelectElement().options);
	optionsContainText("team1", rootGame.getSelectElement().options);
	optionsContainText("team4", rootGame.getSelectElement().options);
}

// Currently winnerSelectedByUser and updateNextGame are the same.
// That may need to change at some point though.
function testUpdateNextGame() {
	priorGame1.updateElementWithName('team1');
	priorGame1.updateNextGame();
	assertEquals(4, rootGame.getSelectElement().options.length);
	optionsContainText("NONE", rootGame.getSelectElement().options);
	optionsContainText("team2", rootGame.getSelectElement().options);
	optionsContainText("team3", rootGame.getSelectElement().options);
	optionsContainText("team1", rootGame.getSelectElement().options);
}

function optionsContainText(textToTest, arrayOfOptions) {
	var optionsText = []
	for (var i = 0; i < arrayOfOptions.length; i++) {
		goog.array.insert(optionsText, arrayOfOptions[i].text);
	}
	assertContains(textToTest, optionsText);
}
