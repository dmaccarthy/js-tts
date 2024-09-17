# js-tts

This is a simple text-to-speech program that runs in a web browser using its built-in speechSynthesis. To get started, [open](https://dmaccarthy.github.io/js-tts/) the webpage.

![Screenshot](https://dmaccarthy.github.io/js-tts/screen02.png)

## Speaking Script

Type your script into the text area, or upload a plain text file by clicking the *Browse* or *Choose File* button and then clicking *Open*.

* Each line will be spoken as a single utterance.
* Use a double hash sign to identify comments. Text following `##` on any line will be ignored.
* A double exclamation mark `!!` at the start of line denotes a command that uses "query string" format. 
* The `v` command selects a new voice number for all subsequent lines until changed.
* The `d` command sets the delay time in seconds before speaking, for the next line only.
* The `a` command sets the delay time in seconds for all subsequent lines where `d` is not specified.
* Click the *Play* button to begin speaking.

## Cast of Voices

Voice 0 is the default voice. You can customize the voice using the selection control, and you can directly edit the pitch, rate, and volume for the voice. The available voices depend on your browser and platform, and some voices may not support changes to the pitch or rate.

Click the first column heading labelled "Voice" to add more voices to the cast.

You can also load your cast of voices from a `json` file.

* Create the file with a key named `cast` that describes an array of voices.
* Each voice description is an array with four values.
* The first value is (part of) a voice name to search for.
* You can use a sequence of names separated by semi-colons. The program will use the first match that it locates.
* The last three items specify the pitch, rate, and volume for the voice.

```
{"cast": [
    ["Google US English; Linda", 1, 1, 1],
    ["Richard; Google UK English Male", 1, 1, 1],
    ["Google UK English Female; Zira", 1, 1, 1],
    ["Mark; David", 1, 1, 1]
]}
```
