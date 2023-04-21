# Reaper template using IEM Plugin Suite
 for mixing HOA (Higher Order Ambisonics) at home using headphones (Binaural)

 ### How to download

 Click on `iem-ambisonic-reaper-template.rpp` then select the `Download raw file`
 
 ### Dependencies
 
 + [Reaper](https://www.reaper.fm/download.php)
 + [IEM Plug-in Suite](https://plugins.iem.at/) (check the [documentation](https://plugins.iem.at/docs/installation/) for installation)
 + Headphones (open or closed back over-ear headphones preferably)

### Project Structure

+ Binaural Decoder/MasterSend (Decodes our b-format ambisonic signal into Binaural and outputted over the Master Track which sends to our headphones)
  + AmbisonicBus (Holds our HOA signal which we can decode/render from)
    + Reverb 
    + Delay
    + MixCompressor
      + StereoEncoder
      + RoomEncoder

## Signal Flow
----
Below is a diagram showing how audio signals are passed through each bus.

Key:
+ Straight line = always sending audio.
+ Dashed line = optino to route audio but not by default.
+ Dotted line = conceptual signal send to and from the selected audio device.

![diagram](readme_resources/signal-flow.drawio.svg)

<br/><br/>

## Sending Audio to Reverb/Delay Buses
----

1. You can either insert audio onto the track by either: 
   + selecting the `RoomEncoder` or `StereoEncoder` Track and going to the taskbar and selecting `Insert` -> `Media File...`.
   + Dragging an audio file onto the track in the timeline as shown below.

![Alt text](readme_resources/placing_clip.gif)

<br/><br/>

2. Check the track routing and make sure that it's **16 channels** as we are working in **Third-Order-Ambisonics** in this template.

![Alt text](readme_resources/check_channels.gif)

<br/><br/>

1. If you want to send audio through to the `Reverb` and `Delay` buses, you select the Route button then `Add new send`... and select the bus you want to send audio to.

![Alt text](readme_resources/send_to_bus.gif)

<br/><br/>

4. Make sure that you set the Audio channels from `1/2` to `1/16` so that we are sending all channels through the bus, rather than just the default stereo channels.

![Alt text](readme_resources/check_mutlichannel.gif)

<br/><br/>

## Exporting Audio
----

Once you are happy with your mix it's now time to export your ambisonic audio track.
How you export your track depends entirely on what software or service you want to play your audio content...

### Third Order Ambisonics
If you are going to be exhibiting your audio to an array of speakers ([see examples here](https://en.wikipedia.org/wiki/Ambisonic_reproduction_systems)) at venues such as IRCAM, IKLECTIK, MONOM, or during exhitions with your own speaker arrays. You are generally going to be want to export in Higher Order Ambisonics (HOA) so that there is enough definition in the ambisonic signal so that it can be reproduced with little chance of artefacts such as comb filtering or phase cancellation ([DOI:10.14279/depositonce-6]()).

To begin exporting your 16 Channel Ambisonic track:
+ Make sure that in all the FX panel on all tracks, that the IEM plugins being used are set to `Auto(3rd)`, and Normalization = `SN3D`
+ All tracks have 16 channels, do this by clicking on the Route button and setting `Track Channels: ` to `16`.
  1. Once above is confirmed, select the <span style="color:purple">Ambisonic Bus</span>. _(If you are using reverb/delay, it's recommended to select a time region before your render so that you it will actually record the release of the effects, otherwise it will stop rendering when the last track clip finishes ([see more details here](https://dlz.reaper.fm/userguide/ReaperUserGuide676d.pdf#%5B%7B%22num%22%3A55147%2C%22gen%22%3A0%7D%2C%7B%22name%22%3A%22XYZ%22%7D%2C108.6%2C721.1%2C0%5D)))_. 
  2. Go `File` -> `Render...`
  3.  

### First Order Ambisonics (Unity, Unreal, Youtube, etc...)
For most applications which render your Ambisonic track to Binaural, you will be limited to First Order Ambisonics (FOA). This is only 4 channels so you don't have as much definition as HOA

### Export Binaural (Anywhere which takes a Stereo Track)








<!-- <img src="placing_clip.gif" alt= “placing_clip_on_track” width="50%" height="50%"> -->

### TO-DO ###

+ ~~flowchart of signal flow in project.~~
+ ~~some gifs about sending reverb/delay.~~
+ link to accompanying videos onces edited.
+ exporting first & higher ambisonic, and binaural mixes.


