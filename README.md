# 3D Point Depth Projection

Is an After Effects tool that allows you to quickly extract 3d coordinates and place any object to it.  
Requirement: Depth map and 3d camera data.  

## Credits
Plugin & expressions: `fadaaszhi` (discord)  
Script: `shy_rikki` (discord)  
https://www.youtube.com/@shy_rikki  

## Installation
1. Download the tool: https://github.com/eirisocherry/3d-point-depth-projection/releases  
2. Move the `3D Point Depth Projection` folder and `3D_Point_Depth_Projection.jsx` script to:  
`C:\Program Files\Adobe\Adobe After Effects <version>\Support Files\Scripts\ScriptUI Panels`  
3. Move the `SimpleLight.aex` plugin to:  
   `C:\Program Files\Adobe\Adobe After Effects CC <version>\Support Files\Plug-ins`  
4. Restart After Effects.  

## Usage
### Setup
1. Open After Effects.  
2. Go to `Window`, scroll down and open `3D_Point_Depth_Projection.jsx`.  
3. The script panel will open. It's dockable.  
4. Import a 3d camera data.  
CSGO: https://www.youtube.com/watch?v=78Y_Y-i5h2c  
COD4: https://github.com/gmzorz/MVMAETools/blob/main/Support%20Files/Scripts/ScriptUI%20Panels/MVMTools.jsx  
5. Import a depth map of your composition.    
6. Select the depth map and setup a projection by pressing **[+]** button.  
7. Adjust **'Depth settings':**  
**'Black is Near'** check it if a black color is near on your depth map, uncheck if it's not.  
**'Far'** the farthest depth point value:  
CSGO (if you use my cfgs): `4096`  
COD4: `4080`  
EXR Depth: set the same value you set in EXtractoR  
8.  Project any objects you want.  

> [!WARNING]
> The script is heavy and may crash your After Effects, but don't worry!  
> It automatically saves your project before doing any actions, so even if your AE will crash, you will not lose any of your progress.  
>  
> 'Auto Orient' works only with high precision 16+ bit depth maps.  

https://github.com/eirisocherry/3d-point-depth-projection/assets/115040224/99b23a49-3bc6-40df-b8ae-975871f2bdc4  

### SimpleLight
When you project 'SimpleLight' it makes a dublicate of your 'Depth for Projection' layer and applies 'SimpleLight' plugin to it  

`[x] SL` SimpleLight settings:  
**'Black is Near'** takes value from '3D Point Depth Projection' effect  
**'Far'** takes value from '3D Point Depth Projection' effect  
**'FOV'** links to your camera FOV  
**'Light (View Space)'** links to a point light `----[x] SL Light----`  
**'Light Range'** range of the light  

`[x] SL Adj` Adjustment Layer settings:  
It uses SimpleLight `[x] SL` as a luma mask  
**'CC Toner'** allows you change the color of the light  
**'Exposure'** allows you to change the brightness of the light  

`----[x] SL Light----` Point Light settings:  
'Color' links to the 'CC toner' effect, which is applied to `[x] SL Adj`  

'Projection settings' are self-explanatory.  

https://github.com/eirisocherry/3d-point-depth-projection/assets/115040224/cbfc4cf9-eada-4d95-9cf7-0d9be496b035

### Keyframes
When you project 'Keyframes', they are being stored in the 'Collected Keyframes' group  

https://github.com/eirisocherry/3d-point-depth-projection/assets/115040224/78707934-496d-41d2-98cb-9f9d96279cc5  

### Solid
When you project a 'Solid', it takes properties from 'Projected Solid' and color from 'Projection settings'  
`Ctrl + Shift + Y` to open 'Solid' settings  

https://github.com/eirisocherry/3d-point-depth-projection/assets/115040224/094be86c-2ffa-4d01-bc7b-38713cfdc518  

### Link-Bake  
If you want to adjust position & orientation of an object:  
1. Press [⚙] button.  
2. Select 'Depth for Projection' and layers you want to make controllers for.  
3. Press [Link] button and adjust positions.  
4. To apply changes, select controllers and press [Bake] button.  

https://github.com/eirisocherry/3d-point-depth-projection/assets/115040224/50e2767d-9676-4130-8c9f-919d189ae79b  

### Merge Depth
To merge depth layers, select them and press [Merge Depth] button.  
It will create a 'Merged Depth' solid with adjustment layer which uses 'Merged Depth' solid as a luma mask.  

Since 'Merged Depth' uses links to the depth layers you've selected, all the changes you make for them will be automatically applied to 'Merged Depth'.  

https://github.com/eirisocherry/3d-point-depth-projection/assets/115040224/fe1b7bed-5818-46f4-a24a-f0c6a98471ea  

## Support
If you have any questions or found a bug, please create an issue in this repository or dm me in discord: `shy_rikki`  
