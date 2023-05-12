# Audio SDK/Packages

### 3DTune-In AudioToolkit

3D Audio Spatialiser and Hearing Aid and Hearing Loss Simulation

### Microsoft HRTF Spatailizer

A cross-platform spatializer plugin (supported on Windows and Android) that uses highly efficient spatial audio DSP processing algorithms.

[Download most recent package here.](https://github.com/microsoft/spatialaudio-unity/releases/tag/v2.0.37)


### Oculus Spatializer

Package which comes with the [Oculus Integration](https://assetstore.unity.com/packages/tools/integration/oculus-integration-82022) package needed for developing for Meta (Oculus) Quest 2, but also seperately [here](https://developer.oculus.com/downloads/audio/)

### Resonance Audio (**DEPRECIATED** But still works)

Package by Google, which ha since been archived. Includes SDKs for Unity, Unreal, and also a JavaScript library for Web Audio Applications. Resonance Audio [simulates how sound waves interact with human ears](https://resonance-audio.github.io/resonance-audio/discover/concepts#simulating-sound-waves-interacting-with-human-ears) and their [environment](https://resonance-audio.github.io/resonance-audio/discover/concepts#simulating-sound-waves-interacting-with-their-environment).

[Download](https://resonance-audio.github.io/resonance-audio/develop/downloads.html)



### Project Acoustics

Wave acoustic engine for Unity and Unreal by Microsoft, following the research from Project Triton. It models waves rather than traditional raycasting to simulate occlusion, obstruction, portaling and reverberation. Incredibly realistic.

Things to note:
- You have to *bake* this data prior to runtime. This means that you can't have dynamic geometry in the scene (environment objects moving won't change the acoustic space)
- The *baking* process takes place either locally on a Windows/Linux System set up with Docker (Need a PC with a lot of CPU cores, doesn't compute on the GPU)
- Can also *bake* on the cloud using Azure Cloud Services (This costs money £££).

### Steam Audio
Pretty buggy, going to wait 
[HomePage](https://valvesoftware.github.io/steam-audio/)
[GithubReleases](https://github.com/ValveSoftware/steam-audio/releases/tag/v4.1.3)

