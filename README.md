# MIDI to toio.js Sound Converter
A tool for converting a MIDI data to [toio.js](https://github.com/toio/toio.js) melody code.   
In addition, we can also check the conveted sound via toio™ Core Cube, directly.   
![Screen shot](https://github.com/tetunori/MIDI-to-toio.js-sound/raw/assets/screenshot.png)  

## Directory structure
```
MIDI-to-toio.js-sound/
  |
  |- README.md : this document
  |- index.js  : main application 
  |- package.json
  |- LICENSE
  |- sample
  |    |
  |    `- sample.mid : sample midi file. 
  `- server : for browser GUI. 
```

## Installation
Copy this directory under the node workspace.  
  Ex. Under the 'examples/' directory for toio.js.  
Then, put the command below.  
```sh
yarn
```

## Usage
### Launch Application
```sh
node <this directory>/index.js
```
Then, input the following URL in your browser.  
(Google Chrome is strongly recommended.)
```
http://localhost:3000/
```

### STEP 1. Select/Drag&Drop a MIDI file.
You can select a coversion target MIDI file by selecting via system menu or Drag&Drop.  
![File Input](https://github.com/tetunori/MIDI-to-toio.js-sound/raw/assets/input_file.png)  
Support '.mid' file ONLY.  
Support single track MIDI format only. If you input multiple-track MIDI file, This tool will fail to convert.

### STEP 2. (OPTIONAL) Check the sound with Cube.
#### 2-1. Turn a toio™ Core Cube on.
#### 2-2. Push [CONNECT]/[PLAY] buttons one by one.
First, push [CONNECT] button.   
![Connect button](https://github.com/tetunori/MIDI-to-toio.js-sound/raw/assets/connect.png)  
Then you can here the sound the Cube connected and can confirm [PLAY]/[STOP] buttons become available.  
![Play/Stop button](https://github.com/tetunori/MIDI-to-toio.js-sound/raw/assets/play_stop.png)  
By pushing [PLAY] button, cube will sound conveted data melody. You can stop by pushing [STOP] button whenever you want.

### STEP 3. Use the converted melody for toio.js
After selecting MIDI file, converted melody code will be shown in the code.   
![Converted melody](https://github.com/tetunori/MIDI-to-toio.js-sound/raw/assets/converted_melody.png)  
Also, you can copy with [COPY CODE] button.  
![Copy Code button](https://github.com/tetunori/MIDI-to-toio.js-sound/raw/assets/copy_code.png)  
Then, set this array object into the 1st argument of Cube's playSound() API like below.
```javascript
var melody = [
  { durationMs: 125, noteName: 60 }, 
  { durationMs: 125, noteName: 64 }, 
  { durationMs: 125, noteName: 67 }, 
  { durationMs: 125, noteName: 60 }, 
  { durationMs: 125, noteName: 64 }, 
  { durationMs: 125, noteName: 67 }, 
  { durationMs: 125, noteName: 55 }, 
  // ....
];
cube.playSound( melody, 1 );
```

## References
* MATERIAL DESIGN  
  * https://material.io/  
  * https://www.muicss.com/  
* dropify  
  * https://github.com/JeremyFagis/dropify  
* Copy to clipboard  
  * https://qiita.com/simiraaaa/items/2e7478d72f365aa48356  
* Code prettifier  
  * https://github.com/google/code-prettify  
  * https://github.com/tetunori/MESH_SDK_Exported_Data_Viewer  
* MIDI test data  
  * created with 'CHROME MUSIC LAB: SONG MAKER'  
    * https://musiclab.chromeexperiments.com/Song-Maker/  
  
## Notes
* There is no known issue so far.
* This software includes the work that is distributed in the Apache License 2.0.

## Author
Tetsunori NAKAYAMA.
