
//////////////////////////
///   Import modules   ///
//////////////////////////
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 3000;
const MIDIFile = require('midifile');
const MIDIEvents = require("midievents");


////////////////////////
///   Definitions    ///
////////////////////////
// It seems toio.js or cube limitation
const MELODY_LENGTH_MAX = 59;
const NOTE_OFF_NUMBER = 127;

var convertedData = null;
var isCubeConnected = false;

// Cube instance to be controlled.
var cube = null;


//////////////////////////
///   Main Procedure   ///
//////////////////////////
main();

function main(){

	// Procedure on Socket.io
	prepareSocketIOConnection();

	// Prepare GUI server
	startGUIServer();
	
	return;

}

/////////////////////
///   Functions   ///
/////////////////////

// Procedure on Socket.io.
function prepareSocketIOConnection(){
	
	// Socket.io connection.
	io.on( 'connection', (socket) => {
			// console.log( 'a user connected' );

			// Register convert API.
			socket.on( 'convert', ( midi_data ) => {
					// console.log( 'convert API is called.' );
					// console.log( 'midi_data: ' + midi_data.slice(0, 20) );
					convert( midi_data );
			});

			// Register playSound API.
			socket.on( 'playSound', ( dummy ) => {
				// console.log( 'playSound API is called.' );
				playSound();
			});

			// Register stopSound API.
			socket.on( 'stopSound', ( dummy ) => {
				// console.log( 'stopSound API is called.' );
				stopSound();
			});

			// Register connectCube API.
			socket.on( 'connectCube', ( dummy ) => {
				// console.log( 'connectCube API is called.' );
				connectCube();
			});

			// If already connected, issue connected event. Maybe user reloaded.
			if( isCubeConnected === true ){
				var message = JSON.stringify( { event:'eventConnected' } );
				io.emit( 'EVENT', message );
			}

	});

}

// Start GUI Server
function startGUIServer(){

	// Path for internal server
	app.use( express.static( __dirname + '/server') );

	// Return index.html.
	app.get( '/', (req, res) => {
			res.sendFile( __dirname + '/server/index.html' );
	} );

	// Listening port.
	http.listen( PORT, () => console.log(`listening on *:${PORT}`) );

}

// The actual procedure for 'convert' API. 
function convert( midi_data ){

  // Parse MIDI data
	var parsedMidiData = new MIDIFile( midi_data );
	// console.log( parsed_data.header.getFormat() );
	// console.log( parsed_data.header.getTracksCount() );
	
	// Check whether the data is supported format or not.
	if( isSupportedMidiData( parsedMidiData ) === false ){
		console.log( 'Error. Unsupported file.' );
	}else{
		// convert MIDI data to toio.js sound data. 
		convertedData = convertFromMidiData( parsedMidiData );

		// Send message to the connected client.
		var message = JSON.stringify( { event:'eventCompletedConversion', data:convertedData } );
		io.emit( 'EVENT', message );
	}

}

// The actual procedure for 'playSound' API. 
function playSound() {
		
		// Call toio.js playSound API.
		if( cube !== null ){
    	cube.playSound( convertedData, 1 );
		}

}

// The actual procedure for 'stopSound' API. 
function stopSound() {
		
		// Call toio.js stopSound API.
		if( cube !== null ){
    	cube.stopSound();
		}
}

// The actual procedure for 'connectCube' API. 
function connectCube(){

	var message = JSON.stringify( { event:'eventConnected' } );

	// Execute toio.js connect sequence.
	if( cube === null ){
	  // Normal case, 1st time sequence is here.
		const { NearestScanner } = require('@toio/scanner')
		;(async () => {
			
			// Start scanner
			cube = await new NearestScanner().start();

			// Connect to a core cube
			cube.connect();
			isCubeConnected = true;
			
			// Issue connect event to the client
			io.emit( 'EVENT', message );
			
		})();
	}else{	
		// Here is a supplementary path.
		// when a client user reloads GUI by mistake, cube is already connected. So...
		// Just, issue connect event to the client
		io.emit( 'EVENT', message );
	}
	
}

// Judge the specified MIDI file is supported format or not.
// data : [Input] target MIDI data
function isSupportedMidiData( data ){

	var retVal = true;
	
	// Time division format : FPS is not supported.
	if( data.header.getTimeDivision() === MIDIFile.Header.FRAMES_PER_SECONDS ){
		console.log( 'Error. Time Diviesion : Frames/Sec is unsupported.' );
		retVal = false;
	}

	return retVal;

}

// Convert MIDI data to toio.js sound data. 
// data : [Input] target MIDI data
function convertFromMidiData( data ){

	var retMelody = [];						// Melody array for return value.
	var trackCounter = 0; 
	var absTimeTickMilliSec = 0;  // usec. Follow the illustration below.

	// Search tracks
	for( trackCounter = 0; trackCounter < data.header.getTracksCount(); trackCounter++ ){
		var trackEventsChunk = data.tracks[trackCounter].getTrackContent();
		var events = MIDIEvents.createParser( trackEventsChunk );
		var event;
		var currentNote = -1;
		var currentVelocity = -1;
		var isFoundNoteOnEvent = false;

		while( event = events.next() ) {
			// console.log( 'Track #' + trackCounter + '/event' );
			if( event.type === MIDIEvents.EVENT_MIDI ){
				switch( event.subtype ){
					case MIDIEvents.EVENT_MIDI_NOTE_OFF:
						// event.param1 is note number.
						if( currentNote === event.param1 ){
							// console.log( 'deltaTime is ' + event.delta );
							var duration = event.delta * absTimeTickMilliSec;
							if( duration === 0 ){
								console.log( '[WARNING] duration is 0. Skip <Track #' + trackCounter + ', Event #' + event.index + '>' );
							}else{
								inputNoteData( duration, currentNote, currentVelocity, retMelody );
							}
							currentNote = -1;
							currentVelocity = -1;
						}
						break;
					case MIDIEvents.EVENT_MIDI_NOTE_ON:
						// event.param1 is note number.
						// event.param2 is velocity.
						// console.log( 'event.param1 is ' + event.param1 );
						// console.log( 'event.param2 is ' + event.param2 );
						if( currentNote !== -1 ){
							// console.log( 'deltaTime is ' + event.delta );
							var duration = event.delta * absTimeTickMilliSec;
							if( duration === 0 ){
								console.log( '[WARNING] duration is 0. Skip <Track #' + trackCounter + ', Event #' + event.index + '>' );
							}else{
								inputNoteData( duration, currentNote, currentVelocity, retMelody );
							}
						}else{
							// console.log( 'deltaTime is ' + event.delta );
							var duration = event.delta * absTimeTickMilliSec;
							if( duration === 0 ){
								console.log( '[WARNING] duration is 0. Skip <Track #' + trackCounter + ', Event #' + event.index + '>' );
							}else{
								inputNoteData( duration, 0xFF, 0, retMelody );
							}
						}

						isFoundNoteOnEvent = true;
						currentNote = event.param1;
						currentVelocity = event.param2;
						break;
				}
			}else if( event.type === MIDIEvents.EVENT_META ){
				switch( event.subtype ){
					case MIDIEvents.EVENT_META_SET_TEMPO:
						// event.tempo : usec value for 1 beat.
						// 1 / data.header.getTicksPerBeat() : beat value for 1 tick.
						// So absTimeTickMilliSec is usec value for 1 tick.
						absTimeTickMilliSec = event.tempo / data.header.getTicksPerBeat() / 1000;
						console.log( 'absTimeTickMilliSec is ' + absTimeTickMilliSec );
						break;
				}
			}

			// Check length MAX.
			if( retMelody.length >= MELODY_LENGTH_MAX ){
				console.log( '[WARNING] Melody length MAX is : ' + MELODY_LENGTH_MAX +'.' );
				break;
			}

		}

		// Check whether NoteOn event found(it means we should have achieved melody.).
		if( isFoundNoteOnEvent === true ){
			// console.log( 'EVENT_MIDI_NOTE_ON found in track[' + trackCounter +'].' );
			break;
		}

	}

	// console.log( 'Melody is ' + JSON.stringify( retMelody ) );
	return retMelody;
}

// Input converted Note data to the target array.
// duration : [Input]  Duration of the note
// note 		: [Input]  Note data
// velocity : [Input]  Velocity of note in the MIDI data.
// 										 we need handle Velocity:0 as note off. Others are as 'on' 
// target 	: [Output] A note is pushed into this array.
function inputNoteData( duration, note, velocity, target ){
	if( velocity > 0 ){
		target.push( { durationMs: Math.floor( duration ), noteName: note } );
	}else{
		// velocity === 0.
		target.push( { durationMs: Math.floor( duration ), noteName: NOTE_OFF_NUMBER } );
	}
}

