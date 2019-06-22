
///////////////////////
///   Definitions   ///
///////////////////////
// Some states
var isMusicConverted = false;
var isCubeConnected = false;


/////////////////////
///   Socket.io   ///
/////////////////////
// Prepare Socket.io
const socket = io();

// Receive message
socket.on( 'EVENT', (msg) => {
	// console.log( JSON.parse(msg) );

	var obj = JSON.parse( msg );
	// console.log( obj.event );
	switch( obj.event ){
		case 'eventCompletedConversion':
		  // Prettify and print to code region.
			// console.log('[Event]' + obj.event + ', data:' + obj.data );
			var stringForToioJs = '\n' + 
														'/* Cube sound converted from MIDI file */\n' + 
														'\n' + 'var melody = [\n';
			for( var counter = 0; counter < obj.data.length; counter++ ){
				stringForToioJs += '  { durationMs: '+ obj.data[counter].durationMs 
							+', noteName: '+ obj.data[counter].noteName +' }, \n';
			}
			stringForToioJs += '];';
			document.getElementById("output").innerHTML = stringForToioJs;
			document.getElementById("output").setAttribute("class", "prettyprint lang-js linenums");
			PR.prettyPrint();

			// If Cube is already connected, PLAY/STOP buttons will be validated.
			if( isCubeConnected === true ){
				document.getElementById('playSound').disabled = false;
				document.getElementById('stopSound').disabled = false;
			}

			// Enable copyCode button
			document.getElementById('copyCode').disabled = false;

			// Set flag 'Converted'
			isMusicConverted = true;

			break;
		case 'eventConnected':
			// If MIDI data is already converted, PLAY/STOP buttons will be validated.
			if( isMusicConverted === true ){
				document.getElementById('playSound').disabled = false;
				document.getElementById('stopSound').disabled = false;
			}

			// Set flag 'Cube connected'
			isCubeConnected = true;

			// connect button disabled. a little bit redundant.
			connectButton.disabled = true;
			break;
	}
});


/////////////////////////
///   File Selector   ///
/////////////////////////
// Set onChange event to file selector.
var fileSelector = document.getElementById('fileSelector');
fileSelector.onchange = function () {
	var fileReader = new FileReader();
	fileReader.onload = function () {
		// Emit message
		socket.emit( 'convert', fileReader.result );
	}
	var file_data = fileSelector.files[0];
	fileReader.readAsArrayBuffer( file_data );
}

// execute dropify.
$('.dropify').dropify();


////////////////////////////
///   Button Procedure   ///
////////////////////////////
var playSoundButton = document.getElementById('playSound');
playSoundButton.onclick = function (){
	socket.emit( 'playSound', '' );
}

var stopSoundButton = document.getElementById('stopSound');
stopSoundButton.onclick = function (){
	socket.emit( 'stopSound', '' );
}

var connectButton = document.getElementById('connect');
connectButton.onclick = function (){
	// console.log( "connect button clicked." );
	socket.emit( 'connectCube', '' );
	connectButton.disabled = true;
}


/////////////////////
///   Copy Code   ///
/////////////////////
var copyCodeButton = document.getElementById('copyCode');
copyCodeButton.onclick = function (){
	execCopy( document.getElementById("output").innerText );
	document.getElementById('copiedText').style='visibility:visible';
}
copyCodeButton.onmouseout = function (){
	document.getElementById('copiedText').style='visibility:hidden';
}

// from https://qiita.com/simiraaaa/items/2e7478d72f365aa48356
function execCopy(string){
	var temp = document.createElement('div');

	temp.appendChild(document.createElement('pre')).textContent = string;

	var s = temp.style;
	s.position = 'fixed';
	s.left = '-100%';

	document.body.appendChild(temp);
	document.getSelection().selectAllChildren(temp);

	var result = document.execCommand('copy');

	document.body.removeChild(temp);
	// true なら実行できている falseなら失敗か対応していないか
	return result;
}

