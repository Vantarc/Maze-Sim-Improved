/*
MainSupervisorWindow.js v2

Changelog:
 - Added human loaded indicator
*/


//The total time at the start
var maxTime = 8 * 60;

var visable = false;

var robot0Name = "Robot 0";
var robot1Name = "Robot 1";

var scores = [0,0];

var usingDetectionAPI = false;

function receive (message){
	//Receive message from the python supervisor
	//Split on comma
	var parts = message.split(",");

	//If there is a message
	if (parts.length > 0){			
		switch (parts[0]){
			case "startup":
				//Call for set up the robot window
				startup();
				break;
			case "update":
				//Update the information on the robot window every frame (of game time)
				update(parts.slice(1,parts.length + 1));
				break;
			case "unloaded1":
				//Robot 1's controller has been unloaded
				unloadedController(1);
				break;
			case "ended":
				//The game is over
				endGame();
				break;
			case "humanLoaded0":
				//Robot 0's human is loaded
				humanLoadedColour(0);
				break;
			case "humanUnloaded0":
				//Robot 0's human is unloaded
				humanUnloadedColour(0);
				break;
			case "humanLoaded1":
				//Robot 1's human is loaded
				humanLoadedColour(1);
				break;
			case "humanUnloaded1":
				//Robot 1's human is unloaded
				humanUnloadedColour(1);
				break;
			case "activityLoaded0":
				activityLoadedColor(0,parts[1],parts[2],parts[3])
				break;
			case "activityUnloaded0":
				activityUnloadedColour(0)
				break;
			case "activityLoaded1":
				activityLoadedColor(1,parts[1],parts[2],parts[3])
				break;
			case "activityUnloaded1":
				activityUnloadedColour(1)
				break;
			case "historyUpdate":
				let msg = message.split(":");
				let history0 = msg[0].split(",").slice(1,msg[0].length-1)
				updateHistory(history0)
				break;
			case "robotInSimulation0":
				robotQuitColour(0);
				break;
			case "robotInSimulation1":
				robotQuitColour(1);
				break;
			case "robotNotInSimulation0":
				robotQuitUnavailableColour(0);
				break;
			case "robotNotInSimulation1":
				robotQuitUnavailableColour(1);
				break;
		}
	}
}

function robotQuitColour(id){
	//setEnableButton('quit'+id, true)
	// setEnableButton('relocate'+id, true)
	// setEnableButton('load'+id, true)
	// setEnableButton('unload'+id, true)
}
function robotQuitUnavailableColour(id){
	//setEnableButton('quit'+id, false)
	// setEnableButton('relocate'+id, false)
	// setEnableButton('load'+id, false)
	// setEnableButton('unload'+id, false)
}

function humanLoadedColour(id){
	// Changes svg human indicator to gold to indicate a human is loaded
	document.getElementById("human"+id+"a").style.stroke = "#edae39";
	document.getElementById("human"+id+"b").style.stroke = "#edae39";
}
function humanUnloadedColour(id){
	// Changes svg human indicator to black to indicate a human is unloaded
	document.getElementById("human"+id+"a").style.stroke = "black";
	document.getElementById("human"+id+"b").style.stroke = "black";
}

function activityLoadedColor(id,r,g,b){
	document.getElementById("activity"+id).style.stroke = "rgb("+(Number(r)*255).toString()+","+(Number(g)*255).toString()+", "+(Number(b)*255).toString()+")";
}
function activityUnloadedColour(id){
	document.getElementById("activity"+id).style.stroke = "black";
}
function updateHistory(history0){
	let text = ""


	let history0End = false;
	// let history1End = false;

	let i = history0.length -1;
	// let j = history1.length -1;


	while(!history0End){
		text += "<tr id='historyrow'>";
		if(history0[i] != null){
			if(history0[i].indexOf("+") != -1){
				text += "<div class='outerDiv'><div class='innerDiv'><td id='historyrowtext' style='font-size:18px;color:#2980b9;'>"+history0[i]+"</td></div></div>";
			}else if(history0[i].indexOf("-") != -1){
				text += "<div class='outerDiv'><div class='innerDiv'><td id='historyrowtext' style='font-size:18px;color:#c0392b;'>"+history0[i]+"</td></div></div>";
			}else{
				text += "<div class='outerDiv'><div class='innerDiv'><td id='historyrowtext' style='font-size:18px;color:#2c3e50;'>"+history0[i]+"</td></div></div>";
			}

			i--;
		}else{
			text += "<div class='outerDiv'><div class='innerDiv'><td id='historyrowtext'></td></div></div>"
			history0End = true;
		}
		text += "</tr>";
	}
	document.getElementById("history").innerHTML = text;
}

function startup (){
	//Turn on the run button and reset button when the program has loaded
	setEnableButton("runButton", true);
	setEnableButton("pauseButton", false);
	setEnableButton("resetButton", true);

	// setEnableButton('quit0', false)
	setEnableButton('relocate0', false)
}

function update (data){
	//Update the ui each frame of the simulation
	//Sets the scores and the timer
	document.getElementById("score0").innerHTML = String(data[0]);

	scores = [data[0],0]

	document.getElementById("timer").innerHTML = calculateTimeRemaining(data[1]);
}

function calculateTimeRemaining(done){
	//Create the string for the time remaining (mm:ss) given the amount of time elapsed
	//Convert to an integer
	done = Math.floor(done);
	//Calculate number of seconds remaining
	var remaining = maxTime - done;
	//Calculate seconds part of the time
	var seconds = Math.floor(remaining % 60);
	//Calculate the minutes part of the time
	var mins = Math.floor((remaining - seconds) / 60);
	//Convert parts to strings
	mins = String(mins)
	seconds = String(seconds)

	//Add leading 0s if necessary
	for (var i = 0; i < 2 - seconds.length; i++){
		seconds = "0" + seconds;
	}

	for (var i = 0; i < 2 - mins.length ; i++){
		mins = "0" + mins;
	}

	//Return the time string
	return mins + ":" + seconds;
}

function runPressed(){

	//When the run button is pressed
	//Disable the run button
	setEnableButton("runButton", false);
	//Send a run command
	//Enable the pause button
	setEnableButton("pauseButton", true);
	
	// setEnableButton('quit0', true)
	setEnableButton('relocate0', true)
	window.robotWindow.send("run");
}

function pausePressed(){
	//When the pause button is pressed
	//Turn off pause button, on run button and send signal to pause
	setEnableButton("pauseButton", false);
	setEnableButton("runButton", true);
	window.robotWindow.send("pause");
}

function resetPressed(){
	//When the reset button is pressed
	//Disable all buttons
	setEnableButton("runButton", false)
	setEnableButton("pauseButton", false);
	setEnableButton("resetButton", false);
	//Send signal to reset everything
	window.robotWindow.send("reset");
}

function setEnableButton(name, state){
	//Set the disabled state of a button (state is if it is enabled as a boolean)
	document.getElementById(name).disabled = !state;
}

//Set the onload command for the window
window.onload = function(){
	//Connect the window
	window.robotWindow = webots.window();
	//Set the title
	window.robotWindow.setTitle('Simulation Controls');
	//Set which function handles the recieved messages
	window.robotWindow.receive = receive;
	//Set timer to inital time value
	document.getElementById("timer").innerHTML = calculateTimeRemaining(0);
};

function endGame(){
	//Once the game is over turn off both the run and pause buttons
	setEnableButton("runButton", false)
	setEnableButton("pauseButton", false);
}

function hide_winning_screen(){
	//Disable winner screen
	document.getElementById("winning-screen").style.display = "none";
}

function calculateWinner(name0,name1){
	//if scores are the same
	if (scores[0] == scores[1]){
		//Show draw text
		document.getElementById("winning-team").innerHTML = "Draw!"
	}else {
		//Find index of highest scoring team

		if (scores[0] > scores[1]){
			//Show robot 0 win text
			document.getElementById("winning-team").innerHTML = name0 + " wins!"
		} else {
			//Show robot 1 win text
			document.getElementById("winning-team").innerHTML = name1 + " wins!"
		}
	}

}

function show_winning_screen(){
	calculateWinner(robot0Name,robot1Name);
	//Show winning screen
  	document.getElementById("winning-screen").style.display = "inline-block";
  	visable = true;
}

function relocate(id){
	window.robotWindow.send("relocate,"+id.toString());
}

function quit(id){
	unloadPressed(id);
	window.robotWindow.send("quit,"+id.toString());
}

function updateDectectionApi(){
	if (!usingDetectionAPI){
		document.getElementById("detectionApi").style.borderColor = "#ba53ba";
		document.getElementById("detectionApi").style.color = "#ba53ba";
		document.getElementById("detectionApi").innerHTML = "No Detection API";
		window.robotWindow.send("detectionApi,0");
	} else {
		document.getElementById("detectionApi").style.borderColor = "#811b9b";
		document.getElementById("detectionApi").style.color = "#811b9b";
		document.getElementById("detectionApi").innerHTML = "Using Detection API";
		window.robotWindow.send("detectionApi,1");
	}
}
