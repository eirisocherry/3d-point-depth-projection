



// -------------------Code-------------------

function DepthProjection(thisObj) {

    // -------------------Global variables-------------------

    // About
    var name = "3D Point Depth Projection";
    var version = "1.0";

    // Build UI
    var dropdownMenuSelection;

    // Misc
    var alertMessage = [];

    function buildUI(thisObj) {

        // -------------------UI-------------------

        var myPanel = (thisObj instanceof Panel) ? thisObj : new Window("palette", name + " " + version, undefined, { resizeable: true });

        // UI elements
        res = "group\
            {\
                orientation:'column',  alignment:['fill','center'], alignChildren:['fill','fill'],\
                setupGroup: Group\
                {\
                    orientation:'column', alignChildren:['fill','center'],\
                    staticText: StaticText{text: '3D Point Depth Projection', alignment:['center','center']}\
                    projectGroup: Group\
                    {\
                        orientation:'row', alignChildren:['fill','center'],\
                        projectButton: Button{text: 'Project'},\
                        typeDropdown: DropDownList{properties:{items:['Point Light', 'Spot Light', 'SimpleLight', 'Keyframes', 'Solid', '3D Null', '3D+2D Null']}},\
                    },\
                    settingsGroup: Group\
                    {\
                        orientation:'row', alignment:['right','center'],\
                        settingsButton: Button{text: '⚙', maximumSize:[25,25]}\
                        helpButton: Button{text: '?', maximumSize:[25,25]},\
                        setupButton: Button{text: '+', maximumSize:[25,25]}\
                        deleteSetupButton: Button{text: 'x', maximumSize:[25,25]},\
                    }\
                }\
            }";

        // Add UI elements to the panel
        myPanel.grp = myPanel.add(res);
        // Refresh the panel
        myPanel.layout.layout(true);
        // Set minimal panel size
        myPanel.grp.minimumSize = myPanel.grp.size;
        // Add panel resizing function 
        myPanel.layout.resize();
        myPanel.onResizing = myPanel.onResize = function () {
            this.layout.resize();
        }

        // -------------------Buttons-------------------

        myPanel.grp.setupGroup.projectGroup.projectButton.onClick = function () {
            projectButton();
        }

        myPanel.grp.setupGroup.projectGroup.typeDropdown.selection = 0;
        dropdownMenuSelection = myPanel.grp.setupGroup.projectGroup.typeDropdown.selection.text;
        myPanel.grp.setupGroup.projectGroup.typeDropdown.onChange = function () {
            dropdownMenuSelection = myPanel.grp.setupGroup.projectGroup.typeDropdown.selection.text;
        }

        myPanel.grp.setupGroup.settingsGroup.settingsButton.onClick = function () {
            settingsButton();
        }

        myPanel.grp.setupGroup.settingsGroup.helpButton.onClick = function () {
            alertCopy(
                'Script: https://www.youtube.com/@shy_rikki\n' +
                'Plugin & expressions: fadaaszhi (discord)\n' +
                'Source: https://github.com/eirisocherry/3d-point-depth-projection'
            );
        }

        myPanel.grp.setupGroup.settingsGroup.setupButton.onClick = function () {
            setupButton();
        }

        myPanel.grp.setupGroup.settingsGroup.deleteSetupButton.onClick = function () {
            deleteSetupButton();
        }

        return myPanel;
    }

    createSettingsUI();

    function createSettingsUI(thisObj) {

        // -------------------UI-------------------

        var settingsPanel = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Functions", undefined, { resizeable: true });

        // UI elements
        var res = "group\
        {\
            orientation:'column', alignment:['fill','top'], alignChildren:['fill','top'], spacing:5, margins:10,\
            linkGroup: Group\
            {\
                orientation:'row', alignChildren:['fill','center'],\
                linkButton: Button{text: 'Link'},\
                bakeButton: Button{text: 'Bake'},\
            },\
            mergeButton: Button{text: 'Merge Depth'},\
            closeButton: Button{text: 'Close'},\
        }";

        // Add UI elements to the panel
        settingsPanel.grp = settingsPanel.add(res);
        // Refresh the panel
        settingsPanel.layout.layout(true);
        // Set minimal panel size
        settingsPanel.grp.minimumSize = settingsPanel.grp.size;
        // Add panel resizing function 
        settingsPanel.layout.resize();
        settingsPanel.onResizing = settingsPanel.onResize = function () {
            this.layout.resize();
        }

        // -------------------Buttons-------------------

        settingsPanel.grp.linkGroup.linkButton.onClick = function () {
            linkButton();
        };

        settingsPanel.grp.linkGroup.bakeButton.onClick = function () {
            bakeButton();
        };

        settingsPanel.grp.mergeButton.onClick = function () {
            mergeButton();
        };

        settingsPanel.grp.closeButton.onClick = function () {
            settingsPanel.hide();
        };

        settingsButton = function () {
            if (settingsPanel && settingsPanel.visible) {
                settingsPanel.hide();
            } else if (settingsPanel) {
                settingsPanel.show();
            } else {
                alert("Settings panel is not available.");
            }
        }

        return settingsPanel;
    }

    // -------------------Buttons-------------------

    function setupButton() {

        // -------------------Checkers-------------------

        var comp = app.project.activeItem;
        var mainLayer = comp.selectedLayers[0];

        if (!(comp instanceof CompItem)) {
            alert("Open a composition first.");
            return;
        }

        if (!comp.activeCamera) {
            alert("No active camera found.");
            return;
        }

        if (comp.selectedLayers.length !== 1 || !mainLayer.hasVideo) {
            alert("Select a single depth map.");
            return;
        }

        if (effectsExistance(mainLayer, "3D Point Depth Projection")) {
            alert("You've already made a setup for this layer.\nIf you wanna delete a setup, press [x] button");
            return;
        }

        // -------------------Setup-------------------

        app.project.save();

        app.beginUndoGroup("Apply Depth Projection");

        // Unique name generator
        var projectedLayerName = "Projected Solid";
        var mainLayerName = "Depth for Projection";
        var count = 1;
        while (true) {
            var projectedLayerExists = comp.layers.byName(projectedLayerName + (count > 1 ? " " + count : ""));
            var mainLayerExists = comp.layers.byName(mainLayerName + (count > 1 ? " " + count : ""));

            if ((projectedLayerExists && projectedLayerExists !== mainLayer) ||
                (mainLayerExists && mainLayerExists !== mainLayer)) {
                count++;
            } else {
                break;
            }
        }
        projectedLayerName += (count > 1 ? " " + count : "");
        mainLayerName += (count > 1 ? " " + count : "");
        mainLayer.name = mainLayerName;
        mainLayer.label = 14; // Cyan

        // Apply preset
        if (applyDepthProjectionFFX(comp, mainLayer) === 0) {
            return;
        }

        // Create a solid
        var projectedLayer = comp.layers.addSolid(
            [0, 1, 0.965],
            projectedLayerName,
            100,
            100,
            1);
        projectedLayer.threeDLayer = true;
        projectedLayer.transform.scale.setValue([100, 100, 100]);
        projectedLayer.transform.opacity.setValue(60);
        projectedLayer.property("ADBE Material Options Group").property("ADBE Accepts Lights").setValue(0);
        projectedLayer.startTime = mainLayer.startTime;
        projectedLayer.inPoint = mainLayer.inPoint;
        projectedLayer.outPoint = mainLayer.outPoint;
        projectedLayer.label = 14; // Cyan

        // -------------------Origin-------------------

        var originLayer = comp.layers.byName("Origin - Don't Delete");
        if (!originLayer) {
            originLayer = comp.layers.addNull();
            originLayer.name = "Origin - Don't Delete";
            originLayer.moveToEnd();
            originLayer.threeDLayer = true;
            originLayer.transform.position.setValue([0, 0, 0]);
            originLayer.enabled = false;
            originLayer.locked = true;
            originLayer.shy = true;
            originLayer.selected = false;
            originLayer.label = 14; // Cyan
        }
        comp.hideShyLayers = true;

        // -------------------Expressions-------------------

        var positionExpression =
            '// Fixes a bug where you can\'t divide by a sampleImage() value\n' +
            'function    bugFix(a) {\n' +
            '    return  (a != 0 ? a : 1);\n' +
            '}\n' +
            '\n' +
            'function    screenSpaceToWorldSpace(point) {\n' +
            '    var     depth                 = ((blackIsNear == 1) ? bugFix(depthLayer.sampleImage(point, [0.5, 0.5], true, time)[0]) : bugFix(1 - depthLayer.sampleImage(point, [0.5, 0.5], true, time)[0])) * far,\n' +
            '            screenSpaceCoordinate = [point[0], point[1], cameraZoom - cameraZoom / depth],\n' +
            '            worldSpaceCoordinate  = origin.fromComp(screenSpaceCoordinate);\n' +
            '    return  worldSpaceCoordinate;\n' +
            '}\n' +
            '\n' +
            'var        depthLayer      = thisComp.layer("' + mainLayer.name + '"),\n' +
            '           point           = depthLayer.effect("3D Point Depth Projection")("Project on Point"),\n' +
            '           far             = depthLayer.effect("3D Point Depth Projection")("Far"),\n' +
            '           blackIsNear     = depthLayer.effect("3D Point Depth Projection")("Black is Near"),\n' +
            '           cameraZoom      = thisComp.activeCamera.zoom,\n' +
            '           origin          = thisComp.layer("Origin - Don\'t Delete"),\n' +
            '           p0              = screenSpaceToWorldSpace(point);\n' +
            'p0';

        var orientationExpression =
            'var        depthLayer      = thisComp.layer("' + mainLayer.name + '"),\n' +
            '           point           = depthLayer.effect("3D Point Depth Projection")("Project on Point"),\n' +
            '           far             = depthLayer.effect("3D Point Depth Projection")("Far"),\n' +
            '           blackIsNear     = depthLayer.effect("3D Point Depth Projection")("Black is Near"),\n' +
            '           autoOrient      = depthLayer.effect("3D Point Depth Projection")("Auto Orient");\n' +
            '           cameraZoom      = thisComp.activeCamera.zoom,\n' +
            '           origin          = thisComp.layer("Origin - Don\'t Delete");\n' +
            '\n' +
            'if (autoOrient == 1){\n' +
            '// Fixes a bug where you can\'t divide by a sampleImage() value\n' +
            'function    bugFix(a) \n' +
            '{\n' +
            '    return  (a != 0 ? a : 1);\n' +
            '}\n' +
            '\n' +
            'function    screenSpaceToWorldSpace(point) \n' +
            '{\n' +
            '    var     depth                 = ((blackIsNear == 1) ? bugFix(depthLayer.sampleImage(point, [0.5, 0.5], true, time)[0]) : bugFix(1 - depthLayer.sampleImage(point, [0.5, 0.5], true, time)[0])) * far,\n' +
            '            screenSpaceCoordinate = [point[0], point[1], cameraZoom - cameraZoom / depth],\n' +
            '            worldSpaceCoordinate  = origin.fromComp(screenSpaceCoordinate);\n' +
            '    return  worldSpaceCoordinate;\n' +
            '}\n' +
            'var        p0              = screenSpaceToWorldSpace(point),\n' +
            '           p1              = screenSpaceToWorldSpace(point + [1, 0]),\n' +
            '           p2              = screenSpaceToWorldSpace(point + [0, 1]),\n' +
            '           normal;\n' +
            '\n' +
            'normal = normalize(cross(p1 - p0, p0 - p2));\n' +
            '\n' +
            'var         xRot                  = Math.atan2(normal[1], -normal[2]),\n' +
            '            yRot                  = Math.atan2(normal[0], Math.sqrt(normal[1] * normal[1] + normal[2] * normal[2])) * -1,\n' +
            '            zRot                  = -Math.atan2(Math.cos(xRot), Math.sin(xRot) * Math.sin(yRot)),\n' +
            '            decimalPlaces         = 2,\n' +
            //'            r                     = 10 ** decimalPlaces;\n' +
            '            r                     = 100;\n' +
            '\n' +
            'if (        \n' +
            '            Math.round(Math.abs(normal[0]) * r) / r == 1 || \n' +
            '            Math.round(Math.abs(normal[1]) * r) / r == 1 || \n' +
            '            Math.round(Math.abs(normal[2]) * r) / r == 1\n' +
            ') {\n' +
            '            zRot                  = 0;\n' +
            '}\n' +
            '\n' +
            '[radiansToDegrees(xRot), radiansToDegrees(yRot), radiansToDegrees(zRot)];\n' +
            '} else {\n' +
            '[value[0], value[1], value[2]];\n' +
            '}';

        var opacityExpression =
            'var showProjectedSolid = thisComp.layer("' + mainLayer.name + '").effect("3D Point Depth Projection")("Show Projected Solid");\n' +
            'if (showProjectedSolid == 1) {\n' +
            '    value;\n' +
            '} else {\n' +
            '    0;\n' +
            '}';

        projectedLayer.transform.position.expression = positionExpression;
        projectedLayer.transform.orientation.expression = orientationExpression;
        projectedLayer.transform.opacity.expression = opacityExpression;

        var effects = mainLayer.property("ADBE Effect Parade");
        var depthProjectionEffect = effects.property("3D Point Depth Projection");
        deselectAll(comp);
        depthProjectionEffect.selected = true;

        app.endUndoGroup();
    }

    function projectButton() {

        // -------------------Checkers-------------------

        var comp = app.project.activeItem;
        var mainLayer = comp.selectedLayers[0];

        if (!(comp instanceof CompItem)) {
            alert("Open a composition first.");
            return;
        }

        if (!comp.activeCamera) {
            alert("No active camera found.");
            return;
        }

        if (comp.selectedLayers.length !== 1 || !mainLayer.hasVideo) {
            alert("Select a single depth layer with a '3D Point Depth Projection' effect.");
            return;
        }

        if (!effectsExistance(mainLayer, "3D Point Depth Projection")) {
            alert("Select a depth layer with a '3D Point Depth Projection' effect.");
            return;
        }

        // -------------------Projection-------------------

        app.project.save();

        app.beginUndoGroup("Project");

        var mainLayerName = mainLayer.name;
        var count = mainLayerName.slice(21);
        var projectedLayerName = "Projected Solid" + (count > 1 ? " " + count : "");
        var projectionLayer = comp.layer(projectedLayerName);
        if (!projectionLayer) {
            alert("'" + projectedLayerName + "' not found. Please, make a new setup.");
            return;
        }
        var projectedPositionValue = projectionLayer.transform.position.valueAtTime(comp.time, false);
        var projectedOrientationValue = projectionLayer.transform.orientation.valueAtTime(comp.time, false);
        var projectedScaleValue = projectionLayer.transform.scale.valueAtTime(comp.time, false);
        var projectedOpacityValue = projectionLayer.transform.opacity.valueAtTime(comp.time, false);
        var projectedLayerWidth = projectionLayer.width;
        var projectedLayerHeight = projectionLayer.height;
        var projectedAcceptsLights = projectionLayer.property("ADBE Material Options Group").property("ADBE Accepts Lights").value;
        var mainLayerEffect = mainLayer.property("ADBE Effect Parade").property("3D Point Depth Projection");
        var randomColorValue = mainLayerEffect.property("Random color").value;
        var ifRandomIsDisabledValue = mainLayerEffect.property("If random is disabled").value;
        var exposureValue = mainLayerEffect.property("Exposure").value;
        var lightRangeValue = mainLayerEffect.property("Light Range").value;

        switch (dropdownMenuSelection) {
            case 'Point Light':
                var newLightName = uniqueIndex(comp, "Point Light");
                var newLight = comp.layers.addLight(newLightName, [comp.width / 2, comp.height / 2]);
                newLight.lightType = LightType.POINT;
                newLight.lightOption.intensity.setValue(100);
                newLight.lightOption.color.setValue(randomColorValue ? [getRandomNumber(0.5, 1), getRandomNumber(0.5, 1), getRandomNumber(0.5, 1)] : ifRandomIsDisabledValue);
                newLight.transform.position.setValue(projectedPositionValue);
                newLight.startTime = mainLayer.startTime;
                newLight.inPoint = mainLayer.inPoint;
                newLight.outPoint = mainLayer.outPoint;
                break;

            case 'Spot Light':
                var newLightName = uniqueIndex(comp, "Spot Light");
                var newLight = comp.layers.addLight(newLightName, [comp.width / 2, comp.height / 2]);
                newLight.lightType = LightType.SPOT;
                newLight.lightOption.intensity.setValue(100);
                newLight.lightOption.color.setValue(randomColorValue ? [getRandomNumber(0.5, 1), getRandomNumber(0.5, 1), getRandomNumber(0.5, 1)] : ifRandomIsDisabledValue);
                newLight.transform.position.setValue(projectedPositionValue);
                newLight.transform.pointOfInterest.setValue([0, 200, 0]);
                newLight.transform.pointOfInterest.expression =
                    "var position = transform.position;\n" +
                    "[position[0]+value[0], position[1]+value[1], position[2]+value[2]];";
                newLight.startTime = mainLayer.startTime;
                newLight.inPoint = mainLayer.inPoint;
                newLight.outPoint = mainLayer.outPoint;
                break;

            case 'SimpleLight':
                try {
                    var simpleLightEffect = mainLayer.Effects.addProperty("ADBE SimpleLight");
                    simpleLightEffect.remove();
                } catch (e) {
                    alert("SimpleLight plugin is not installed.");
                    break;
                }

                var uniqueIndexForSL = (function (comp) {
                    var baseNames = ["----[1] SL Light----", "[1] SL", "[1] SL Adj"];
                    var index = 1;
                    var nameExists;

                    do {
                        nameExists = false;
                        for (var i = 0; i < baseNames.length; i++) {
                            var currentName = baseNames[i].replace("[1]", "[" + index + "]");
                            if (comp.layers.byName(currentName)) {
                                nameExists = true;
                                break;
                            }
                        }
                        if (nameExists) {
                            index++;
                        }
                    } while (nameExists);

                    return index;
                })(comp);
                var simpleLightLayerName = "[" + uniqueIndexForSL + "] SL";
                var newLightName = "----[" + uniqueIndexForSL + "] SL Light----";
                var adjustmentLayerName = "[" + uniqueIndexForSL + "] SL Adj";
                do {
                    var labelColor = Math.round(getRandomNumber(1, 16));
                } while (labelColor === 14);

                var newAdjustmentLayer = comp.layers.addSolid([1, 1, 1], adjustmentLayerName, comp.width, comp.height, 1);
                newAdjustmentLayer.adjustmentLayer = true;
                newAdjustmentLayer.name = adjustmentLayerName;
                newAdjustmentLayer.startTime = mainLayer.startTime;
                newAdjustmentLayer.inPoint = mainLayer.inPoint;
                newAdjustmentLayer.outPoint = mainLayer.outPoint;
                newAdjustmentLayer.Effects.addProperty("CC Toner");
                newAdjustmentLayer.Effects("CC Toner").property("CC Toner-0002").setValue(randomColorValue ? [getRandomNumber(0.5, 1), getRandomNumber(0.5, 1), getRandomNumber(0.5, 1)] : ifRandomIsDisabledValue); //midtones
                newAdjustmentLayer.Effects("CC Toner").property("CC Toner-0004").setValue(0.5); //blend w original
                newAdjustmentLayer.Effects.addProperty("ADBE Exposure");
                newAdjustmentLayer.Effects("ADBE Exposure").property("ADBE Exposure-0003").setValue(exposureValue); //exposure
                newAdjustmentLayer.label = labelColor;

                var mainLayerEffect = mainLayer.property("ADBE Effect Parade").property("3D Point Depth Projection");
                var blackIsNearValue = mainLayerEffect.property("Black is Near").value;
                var farValue = mainLayerEffect.property("Far").value;

                var simpleLightLayer = mainLayer.duplicate();
                simpleLightLayer.name = simpleLightLayerName;
                simpleLightLayer.moveToBeginning();
                simpleLightLayer.enabled = false;
                simpleLightLayer.property("ADBE Effect Parade").property("3D Point Depth Projection").remove();
                simpleLightLayer.label = labelColor;

                // Set track matte depends on AE version 
                if (typeof newAdjustmentLayer.trackMatteType !== "undefined" && typeof newAdjustmentLayer.trackMatteLayer !== "undefined") {
                    newAdjustmentLayer.setTrackMatte(simpleLightLayer, TrackMatteType.LUMA);
                } else {
                    newAdjustmentLayer.trackMatteType = TrackMatteType.LUMA;
                }

                var newLight = comp.layers.addLight(newLightName, [comp.width / 2, comp.height / 2]);
                newLight.lightType = LightType.POINT;
                newLight.lightOption.intensity.setValue(100);
                newLight.lightOption.color.expression =
                    'var ccTonerEffect;\n' +
                    'try {\n' +
                    'ccTonerEffect = thisComp.layer("' + adjustmentLayerName + '").effect("CC Toner")("Midtones");\n' +
                    '} catch (e) {\n' +
                    '   ccTonerEffect = null;\n' +
                    '}\n' +
                    '\n' +
                    'if (ccTonerEffect != null) {\n' +
                    '    ccTonerEffect;\n' +
                    '} else {\n' +
                    '    [1, 1, 1, 1];\n' +
                    '};'
                newLight.transform.position.setValue(projectedPositionValue);
                newLight.startTime = mainLayer.startTime;
                newLight.inPoint = mainLayer.inPoint;
                newLight.outPoint = mainLayer.outPoint;
                newLight.label = labelColor;

                var simpleLightEffect = simpleLightLayer.Effects.addProperty("ADBE SimpleLight");
                simpleLightEffect.property("Black is near").setValue(blackIsNearValue);
                simpleLightEffect.property("Far").setValue(farValue);
                simpleLightEffect.property("FOV").setValue(90);
                simpleLightEffect.property("FOV").expression =
                    'var activeCamera = thisComp.activeCamera;\n' +
                    'if (activeCamera) {\n' +
                    'var cameraZoom = activeCamera.zoom;\n' +
                    'var fov = radiansToDegrees(Math.atan2(thisComp.width / 2, cameraZoom)) * 2;\n' +
                    'fov;\n' +
                    '} else {\n' +
                    'value;\n' +
                    '}';
                simpleLightEffect.property("Light (View Space)").expression =
                    'lightLayer = thisComp.layer("' + newLightName + '");\n' +
                    'thisComp.activeCamera.fromWorld(lightLayer.transform.position);';
                simpleLightEffect.property("Light Range").setValue(lightRangeValue);
                break;

            case 'Keyframes':
                var mainLayerEffect = mainLayer.property("ADBE Effect Parade").property("3D Point Depth Projection");
                mainLayerEffect.property("Position").setValueAtTime(comp.time, projectedPositionValue);
                mainLayerEffect.property("X Rotation").setValueAtTime(comp.time, projectedOrientationValue[0]);
                mainLayerEffect.property("Y Rotation").setValueAtTime(comp.time, projectedOrientationValue[1]);
                mainLayerEffect.property("Z Rotation").setValueAtTime(comp.time, projectedOrientationValue[2]);
                break;

            case 'Solid':
                var newSolidColor = randomColorValue ? [getRandomNumber(0.5, 1), getRandomNumber(0.5, 1), getRandomNumber(0.5, 1)] : [ifRandomIsDisabledValue[0], ifRandomIsDisabledValue[1], ifRandomIsDisabledValue[2]];
                var newSolidName = uniqueIndex(comp, "Solid");
                var newSolid = comp.layers.addSolid(
                    newSolidColor,
                    newSolidName,
                    projectedLayerWidth,
                    projectedLayerHeight,
                    1
                );
                newSolid.threeDLayer = true;
                newSolid.transform.position.setValue(projectedPositionValue);
                newSolid.transform.orientation.setValue(projectedOrientationValue);
                newSolid.transform.scale.setValue(projectedScaleValue);
                newSolid.transform.opacity.setValue(projectedOpacityValue);
                newSolid.property("ADBE Material Options Group").property("ADBE Accepts Lights").setValue(projectedAcceptsLights);
                newSolid.startTime = mainLayer.startTime;
                newSolid.inPoint = mainLayer.inPoint;
                newSolid.outPoint = mainLayer.outPoint;
                break;

            case '3D Null':
                var new3dNullName = uniqueIndex(comp, "3D Null");
                var new3dNull = comp.layers.addNull(comp.width);
                new3dNull.name = new3dNullName;
                new3dNull.threeDLayer = true;
                new3dNull.transform.position.setValue(projectedPositionValue);
                new3dNull.transform.orientation.setValue(projectedOrientationValue);
                new3dNull.transform.scale.setValue([100, 100, 100]);
                new3dNull.startTime = mainLayer.startTime;
                new3dNull.inPoint = mainLayer.inPoint;
                new3dNull.outPoint = mainLayer.outPoint;
                break;

            case '3D+2D Null':
                var uniqueIndexForNulls = (function (comp) {
                    var baseNames = ["[1] 3D Null (Parent)", "[1] 2D Null (Child)"];
                    var index = 1;
                    var nameExists;

                    do {
                        nameExists = false;
                        for (var i = 0; i < baseNames.length; i++) {
                            var currentName = baseNames[i].replace("[1]", "[" + index + "]");
                            if (comp.layers.byName(currentName)) {
                                nameExists = true;
                                break;
                            }
                        }
                        if (nameExists) {
                            index++;
                        }
                    } while (nameExists);

                    return index;
                })(comp);
                var new3dNullName = "[" + uniqueIndexForNulls + "] 3D Null (Parent)";
                var new2dNullName = "[" + uniqueIndexForNulls + "] 2D Null (Child)";

                var new3dNull = comp.layers.addNull(comp.width);
                new3dNull.name = new3dNullName;
                new3dNull.threeDLayer = true;
                new3dNull.transform.position.setValue(projectedPositionValue);
                new3dNull.transform.orientation.setValue(projectedOrientationValue);
                new3dNull.transform.scale.setValue([100, 100, 100]);
                new3dNull.transform.scale.expression =
                    '// 3d scale imitation for 2d layers\n' +
                    'var camera = thisComp.activeCamera;\n' +
                    'var cameraPos = camera.position;\n' +
                    'var layerPos = thisLayer.position;\n' +
                    'var distance = length(cameraPos, layerPos);\n' +
                    'var baseScale = value[0];\n' +
                    'var cameraZoom = camera.zoom;\n' +
                    'var scaleFactor = cameraZoom / distance;\n' +
                    'var newScale = baseScale * scaleFactor;\n' +
                    '[newScale, newScale, newScale];';

                new3dNull.startTime = mainLayer.startTime;
                new3dNull.inPoint = mainLayer.inPoint;
                new3dNull.outPoint = mainLayer.outPoint;

                var new2dNull = comp.layers.addNull();
                new2dNull.name = new2dNullName;
                new2dNull.threeDLayer = false;
                new2dNull.startTime = mainLayer.startTime;
                new2dNull.inPoint = mainLayer.inPoint;
                new2dNull.outPoint = mainLayer.outPoint;
                new2dNull.position.expression =
                    '// 3d to 2d coordinates converter\n' +
                    'New3dNull = thisComp.layer(\"' + new3dNullName + '\");\n' +
                    'New3dNull.toComp(New3dNull.transform.anchorPoint);';
                new2dNull.scale.expression =
                    '// 3d to 2d scale\n' +
                    'scale3D = thisComp.layer(\"' + new3dNullName + '\").transform.scale;\n' +
                    '[scale3D[0], scale3D[1]];';

                break;

            default:
                alert("Select a type of layer you want to project.")
                break;
        }

        deselectAll(comp);
        projectionLayer.moveToBeginning();
        mainLayerEffect.selected = true;

        app.endUndoGroup();
    }

    function deleteSetupButton() {

        // -------------------Checkers-------------------

        var comp = app.project.activeItem;
        var mainLayer = comp.selectedLayers[0];

        if (!(comp instanceof CompItem)) {
            alert("Open a composition first.");
            return;
        }

        if (comp.selectedLayers.length !== 1 || !mainLayer.hasVideo) {
            alert("Select a single depth map you wish to delete setup on");
            return;
        }

        if (!effectsExistance(mainLayer, "3D Point Depth Projection")) {
            alert("Nothing to delete.");
            return;
        }

        var confirmDelete = confirm("Are you sure you want to delete the setup?");
        if (!confirmDelete) {
            return;
        }

        // -------------------Delete-------------------

        app.project.save();

        app.beginUndoGroup("Delete setup");

        mainLayer.property("ADBE Effect Parade").property("3D Point Depth Projection").remove();
        var mainLayerName = mainLayer.name;
        var count = mainLayerName.slice(21);
        var projectedLayerName = "Projected Solid" + (count > 1 ? " " + count : "");
        var projectionLayer = comp.layer(projectedLayerName);
        if (projectionLayer) {
            projectionLayer.remove();
        } else {
            alert("'Projected Solid' is not found, delete it manually, if still exists.")
        }

        deselectAll(comp);
        mainLayer.selected = true;

        app.endUndoGroup();
    }

    function linkButton() {

        // -------------------Checkers-------------------

        var comp = app.project.activeItem;

        if (!(comp instanceof CompItem)) {
            alert("Open a composition first.");
            return;
        }

        if (comp.selectedLayers.length < 2) {
            alert("Select a 'Depth for Projection' and layers you want to make controller for.");
            return;
        }

        // Check if only one working 'depth for projection' layer is selected
        function depthProjectionExtractor(layers) {
            var isArray = layers && typeof layers.length === 'number' && typeof layers !== 'string';
            if (!isArray) {
                layers = [layers];
            }

            var effectExist = 0;
            var foundLayer;

            for (var layerIndex = 0; layerIndex < layers.length; layerIndex++) {
                var layer = layers[layerIndex];
                if (layer.name.indexOf("Depth for Projection") !== -1) {
                    var effects = layer.property("ADBE Effect Parade");
                    if (effects && effects.numProperties != null) {
                        for (var j = 1; j <= effects.numProperties; j++) {
                            if (effects.property(j).name.indexOf("3D Point Depth Projection") !== -1) {
                                effectExist += 1;
                                foundLayer = layer;
                                if (effectExist > 1) {
                                    return [effectExist, foundLayer];
                                }
                                break;
                            }
                        }
                    }
                }
            }

            return [effectExist, foundLayer];
        }
        var effectsChecker = depthProjectionExtractor(comp.selectedLayers);

        if (effectsChecker[0] > 1) {
            alert(
                "You've selected two or more 'Depth for Projection' layers.\n" +
                "\n" +
                "Please, select a 'Depth for Projection' with '3D Point Depth Projection' effect and layers you want to make controller for."
            );
            return;
        }

        if (effectsChecker[0] == 0) {
            alert(
                "'Depth for Projection' is broken or not found.\n" +
                "\n" +
                "Please, select a 'Depth for Projection' with '3D Point Depth Projection' effect and layers you want to make controller for."
            );
            return;
        }

        if (effectsChecker[0] == 1) {
            var mainLayer = effectsChecker[1];
        }

        // -------------------Linker-------------------

        app.project.save();

        app.beginUndoGroup("Link projection");

        var fixedSelectedLayers = comp.selectedLayers.slice();
        var new2dNull;

        for (var i = fixedSelectedLayers.length - 1; i >= 0; i--) {
            var selectedLayer = fixedSelectedLayers[i];
            if (selectedLayer == mainLayer) {
                continue;
            }

            if (!new2dNull) {
                var new2dNull = comp.layers.addNull();
                new2dNull.threeDLayer = false;
                new2dNull.source.width = comp.width;
                new2dNull.source.height = comp.height;
                new2dNull.transform.position.setValue([comp.width / 2, comp.height / 2]);
                new2dNull.transform.position.expression = '[thisComp.width/2, thisComp.height/2];';
                new2dNull.transform.anchorPoint.setValue([comp.width / 2, comp.height / 2]);
                new2dNull.transform.anchorPoint.expression = '[thisComp.width/2, thisComp.height/2];';
                new2dNull.transform.rotation.setValue(0);
                new2dNull.transform.rotation.expression = '0;';
                new2dNull.transform.scale.setValue([100, 100]);
                new2dNull.transform.scale.expression = '[100, 100];';
                new2dNull.startTime = selectedLayer.startTime;
                new2dNull.inPoint = selectedLayer.inPoint;
                new2dNull.outPoint = selectedLayer.outPoint;
                new2dNull.name = uniqueIndex(comp, "[Projection Controller]");

                var layerControlEffect = new2dNull.property("ADBE Effect Parade").addProperty("ADBE Layer Control");
                layerControlEffect.name = "Depth for Projection";
                layerControlEffect.property(1).setValue(mainLayer.index);
            }

            selectedLayer.name = uniqueIndexTwo(comp, selectedLayer.name, selectedLayer);
            var pointEffect = new2dNull.property("ADBE Effect Parade").addProperty("ADBE Point Control");
            pointEffect.name = selectedLayer.name;
            var pointEffectName = pointEffect.name;
            var layerForExpression = new2dNull;

            var positionExpression =
                '// Fixes a bug where you can\'t divide by a sampleImage() value\n' +
                'function    bugFix(a) {\n' +
                '    return  (a != 0 ? a : 1);\n' +
                '}\n' +
                '\n' +
                'function    screenSpaceToWorldSpace(point) {\n' +
                '    var     depth                 = ((blackIsNear == 1) ? bugFix(depthLayer.sampleImage(point, [0.5, 0.5], true, time)[0]) : bugFix(1 - depthLayer.sampleImage(point, [0.5, 0.5], true, time)[0])) * far,\n' +
                '            screenSpaceCoordinate = [point[0], point[1], cameraZoom - cameraZoom / depth],\n' +
                '            worldSpaceCoordinate  = origin.fromComp(screenSpaceCoordinate);\n' +
                '    return  worldSpaceCoordinate;\n' +
                '}\n' +
                '\n' +
                'var        depthLayer      = thisComp.layer("' + layerForExpression.name + '").effect("Depth for Projection")(1),\n' +
                '           point           = thisComp.layer("' + layerForExpression.name + '").effect("' + pointEffectName + '")(1),\n' +
                '           far             = depthLayer.effect("3D Point Depth Projection")("Far"),\n' +
                '           blackIsNear     = depthLayer.effect("3D Point Depth Projection")("Black is Near"),\n' +
                '           cameraZoom      = thisComp.activeCamera.zoom,\n' +
                '           origin          = thisComp.layer("Origin - Don\'t Delete"),\n' +
                '           p0              = screenSpaceToWorldSpace(point);\n' +
                'p0';

            var orientationExpression =
                'var        depthLayer      = thisComp.layer("' + layerForExpression.name + '").effect("Depth for Projection")(1),\n' +
                '           point           = thisComp.layer("' + layerForExpression.name + '").effect("' + pointEffectName + '")(1),\n' +
                '           far             = depthLayer.effect("3D Point Depth Projection")("Far"),\n' +
                '           blackIsNear     = depthLayer.effect("3D Point Depth Projection")("Black is Near"),\n' +
                '           autoOrient      = depthLayer.effect("3D Point Depth Projection")("Auto Orient");\n' +
                '           cameraZoom      = thisComp.activeCamera.zoom,\n' +
                '           origin          = thisComp.layer("Origin - Don\'t Delete");\n' +
                '\n' +
                'if (autoOrient == 1){\n' +
                '// Fixes a bug where you can\'t divide by a sampleImage() value\n' +
                'function    bugFix(a) \n' +
                '{\n' +
                '    return  (a != 0 ? a : 1);\n' +
                '}\n' +
                '\n' +
                'function    screenSpaceToWorldSpace(point) \n' +
                '{\n' +
                '    var     depth                 = ((blackIsNear == 1) ? bugFix(depthLayer.sampleImage(point, [0.5, 0.5], true, time)[0]) : bugFix(1 - depthLayer.sampleImage(point, [0.5, 0.5], true, time)[0])) * far,\n' +
                '            screenSpaceCoordinate = [point[0], point[1], cameraZoom - cameraZoom / depth],\n' +
                '            worldSpaceCoordinate  = origin.fromComp(screenSpaceCoordinate);\n' +
                '    return  worldSpaceCoordinate;\n' +
                '}\n' +
                'var        p0              = screenSpaceToWorldSpace(point),\n' +
                '           p1              = screenSpaceToWorldSpace(point + [1, 0]),\n' +
                '           p2              = screenSpaceToWorldSpace(point + [0, 1]),\n' +
                '           normal;\n' +
                '\n' +
                'normal = normalize(cross(p1 - p0, p0 - p2));\n' +
                '\n' +
                'var         xRot                  = Math.atan2(normal[1], -normal[2]),\n' +
                '            yRot                  = Math.atan2(normal[0], Math.sqrt(normal[1] * normal[1] + normal[2] * normal[2])) * -1,\n' +
                '            zRot                  = -Math.atan2(Math.cos(xRot), Math.sin(xRot) * Math.sin(yRot)),\n' +
                '            decimalPlaces         = 2,\n' +
                //'            r                     = 10 ** decimalPlaces;\n' +
                '            r                     = 100;\n' +
                '\n' +
                'if (        \n' +
                '            Math.round(Math.abs(normal[0]) * r) / r == 1 || \n' +
                '            Math.round(Math.abs(normal[1]) * r) / r == 1 || \n' +
                '            Math.round(Math.abs(normal[2]) * r) / r == 1\n' +
                ') {\n' +
                '            zRot                  = 0;\n' +
                '}\n' +
                '\n' +
                '[radiansToDegrees(xRot), radiansToDegrees(yRot), radiansToDegrees(zRot)];\n' +
                '} else {\n' +
                '[value[0], value[1], value[2]];\n' +
                '}';

            selectedLayer.transform.position.expression = positionExpression;
            try {
                if (selectedLayer.transform.orientation.isModified) {
                    selectedLayer.transform.orientation.expression = orientationExpression;
                } else {
                    // Orientation property is hidden or not accessible
                }
            } catch (e) {
                // Do nothing
            }
        }

        deselectAll(comp);
        new2dNull.selected = true;

        app.endUndoGroup();
    }

    function bakeButton() {

        // -------------------Checkers-------------------

        var comp = app.project.activeItem;

        if (!(comp instanceof CompItem)) {
            alert("Open a composition first.");
            return;
        }

        if (comp.selectedLayers.length == 0) {
            alert("Select controllers or layers connected to them to to bake expressions.");
            return;
        }

        // -------------------Bake-------------------

        app.project.save();

        app.beginUndoGroup("Bake");

        var errorRenamed = false;
        var fixedSelectedLayers = comp.selectedLayers.slice();

        for (var i = fixedSelectedLayers.length - 1; i >= 0; i--) {

            var selectedLayer = fixedSelectedLayers[i];
            var selectedLayerName = selectedLayer.name;
            var mainLayer;
            var mainLayerName;
            var controller;

            // -------------------Case #1 "Controller"-------------------

            if (selectedLayerName.indexOf("[Projection Controller]") !== -1) {

                controller = selectedLayer;
                var effects = controller.property("ADBE Effect Parade");
                var fixedEffectsNumber = effects.numProperties;

                // Collect selected effects names
                var selectedEffectNames = [];
                for (var j = 1; j <= fixedEffectsNumber; j++) {
                    var effect = effects.property(j);
                    if (effect.selected && effect.matchName === "ADBE Point Control") {
                        selectedEffectNames.push(effect.name);
                    }
                }

                // Bake selected effects if exist
                if (selectedEffectNames.length > 0) {
                    for (var i = selectedEffectNames.length - 1; i >= 0; i--) {
                        var effectName = selectedEffectNames[i];
                        var mainLayerName = effectName;
                        var mainLayer = comp.layer(mainLayerName);

                        if (mainLayer) {
                            var hasExpression = bakeProjection(comp, mainLayer);
                            if (hasExpression == false) {
                                alertPush("[" + mainLayer.index + "] \"" + mainLayerName + "\" has nothing to bake.");
                            }
                        } else {
                            alertPush(
                                "\"" + mainLayerName + "\" not found."
                            );
                            errorRenamed = true;
                        }

                        for (var j = 1; j <= fixedEffectsNumber; j++) {
                            var effect = effects.property(j);
                            if (effect.name === effectName) {
                                effect.remove();
                                break;
                            }
                        }
                    }
                } else {
                    // Else bake everything
                    for (var j = fixedEffectsNumber; j >= 1; j--) {
                        var effect = effects.property(j);
                        if (effect.matchName === "ADBE Point Control") {
                            effectName = effect.name;
                            mainLayerName = effectName;
                            mainLayer = comp.layer(mainLayerName);

                            if (mainLayer) {
                                var hasExpression = bakeProjection(comp, mainLayer);
                                if (hasExpression == false) {
                                    alertPush("[" + mainLayer.index + "] \"" + mainLayerName + "\" has nothing to bake.");
                                }
                            } else {
                                alertPush(
                                    "\"" + mainLayerName + "\" not found."
                                );
                                errorRenamed = true;
                            }

                            effect.remove();
                        }
                    }
                    controller.remove();
                }
            } else {

                // -------------------Case #2 "Layer"-------------------

                mainLayer = selectedLayer;
                mainLayerName = selectedLayerName;
                if (!bakeProjection(comp, mainLayer)) {
                    alertPush("[" + mainLayer.index + "] \"" + mainLayerName + "\" has nothing to bake.");
                }
            }
        }

        if (errorRenamed) {
            alertPush("Did you rename the layers? If so, select them manually and press 'Bake'.");
        }

        if (alertMessage != "") {
            alertShow();
        }

        app.endUndoGroup();
    }

    function mergeButton() {

        // -------------------Checkers-------------------

        var comp = app.project.activeItem;

        if (!(comp instanceof CompItem)) {
            alert("Open a composition first.");
            return;
        }

        if (comp.selectedLayers.length < 1) {
            alert("Select depth layers you want to merge.");
            return;
        }

        // -------------------Merge-------------------

        app.project.save();

        app.beginUndoGroup("Merge");

        // Clean-up selection from lights and cameras
        var selectedLayers = comp.selectedLayers.slice();
        var errorCollector = false;
        for (var i = selectedLayers.length; i > 0; i--) {
            var selectedLayer = selectedLayers[i - 1];
            if (!selectedLayer.hasVideo) {
                alertPush('[' + selectedLayer.index + '] "' + selectedLayer.name + '" is not a video.');
                errorCollector = true;
                selectedLayer.selected = false;
                continue;
            }
        }

        var selectedLayersNumber = comp.selectedLayers.length;
        selectedLayers = comp.selectedLayers.slice();
        if (selectedLayersNumber == 0) {
            alertShow("Nothing to merge.");
            return;
        }

        // Find "SL Adj" layers
        var slLayers = [];
        for (var i = 0; i < selectedLayersNumber; i++) {
            var layer = selectedLayers[i];
            if (layer.name.indexOf("SL") !== -1) {
                var adjustmentName = layer.name + " Adj";
                slLayers.push(adjustmentName);
            }
        }

        // Disable "SL Adj" layers
        for (var i = 0; i < slLayers.length; i++) {
            var layer = comp.layer(slLayers[i]);
            if (layer) {
                layer.enabled = false;
            }
        }

        // Generate unique index
        var mergedNames = uniqueIndex(comp, ["Merged Depth", "Merged Adj"]);
        var adjustmentLayerName = mergedNames["Merged Adj"];
        var mergedDepthLayerName = mergedNames["Merged Depth"];

        // Add adjustment layer
        var newAdjustmentLayer = comp.layers.addSolid([1, 1, 1], adjustmentLayerName, comp.width, comp.height, 1);
        newAdjustmentLayer.adjustmentLayer = true;
        newAdjustmentLayer.name = adjustmentLayerName;
        newAdjustmentLayer.Effects.addProperty("CC Toner");
        newAdjustmentLayer.Effects("CC Toner").property("CC Toner-0002").setValue([getRandomNumber(0.5, 1), getRandomNumber(0.5, 1), getRandomNumber(0.5, 1)]); //midtones
        newAdjustmentLayer.Effects("CC Toner").property("CC Toner-0004").setValue(0.5); //blend w original
        newAdjustmentLayer.Effects.addProperty("ADBE Exposure");
        newAdjustmentLayer.Effects("ADBE Exposure").property("ADBE Exposure-0003").setValue(4); //exposure

        // Create merged depth
        var mergedDepthLayer = comp.layers.addSolid(
            [0, 0, 0],              //color
            mergedDepthLayerName,   //name
            comp.width,             //width
            comp.height,            //height
            1);                     //pixel aspect ratio
        mergedDepthLayer.twoDLayer = true;
        mergedDepthLayer.transform.scale.setValue([100, 100]);
        mergedDepthLayer.transform.opacity.setValue(100);
        mergedDepthLayer.enabled = false;

        // Set track matte depends on AE version 
        if (typeof newAdjustmentLayer.trackMatteType !== "undefined" && typeof newAdjustmentLayer.trackMatteLayer !== "undefined") {
            newAdjustmentLayer.setTrackMatte(mergedDepthLayer, TrackMatteType.LUMA);
        } else {
            newAdjustmentLayer.trackMatteType = TrackMatteType.LUMA;
        }

        // Apply blend effect via preset
        deselectAll(comp);
        mergedDepthLayer.selected = true;
        var blendEffect = applyBlendFFX(mergedDepthLayer);
        if (blendEffect === 0) {
            return;
        } else if (blendEffect === -1) {
            alert("Blend.ffx is found but it didn't apply any effect.")
        }

        // Duplicate blend effect
        deselectAll(comp);
        blendEffect.selected = true;
        for (i = 1; i < selectedLayersNumber; i++) {
            app.executeCommand(2080);
        }

        // Adjust settings for every blend effect
        for (var i = 1; i <= selectedLayers.length; i++) {
            var selectedLayer = selectedLayers[i - 1];
            var blendEffectName = (i === 1) ? "Blend" : "Blend " + i;
            var blendEffect = mergedDepthLayer.property("ADBE Effect Parade").property(blendEffectName);
            blendEffect.property("ADBE Blend-0001").setValue(selectedLayer.index);
        }

        if (errorCollector) {
            alertShow();
        }

        deselectAll(comp);
        newAdjustmentLayer.selected = true;

        app.endUndoGroup();
    }

    // -------------------Functions-------------------

    function applyDepthProjectionFFX(comp, mainLayer) {
        // Check if preset exists
        var appFolderPath = Folder.appPackage.parent.fsName; // Path to AE folder 
        var ffxFile = new File(appFolderPath + "/Support Files/Scripts/ScriptUI Panels/3D Point Depth Projection/DepthProjection.ffx");
        if (!ffxFile.exists) {
            alert("DepthProjection.ffx not found. Please ensure the script is installed correctly.");
            return 0;
        }

        // Apply preset and return effect
        var layer = mainLayer;
        var effects = layer.property("ADBE Effect Parade");
        var numEffectsBefore = effects.numProperties;
        layer.applyPreset(ffxFile);
        var numEffectsAfter = effects.numProperties;
        for (var i = numEffectsBefore + 1; i <= numEffectsAfter; i++) {
            var effect = effects.property(i);
            if (effect) {
                return effect;
            }
        }
        alert("The preset failed to add any effects. Please check if the preset file is valid.")
        return 0;
    }

    function applyBlendFFX(mainLayer) {
        // Check if preset exists
        var appFolderPath = Folder.appPackage.parent.fsName; // Path to AE folder 
        var ffxFile = new File(appFolderPath + "/Support Files/Scripts/ScriptUI Panels/3D Point Depth Projection/Blend.ffx");
        if (!ffxFile.exists) {
            alert("Blend.ffx not found. Please ensure the script is installed correctly.");
            return 0;
        }

        // Apply preset and return effect
        var layer = mainLayer;
        var effects = layer.property("ADBE Effect Parade");
        var numEffectsBefore = effects.numProperties;
        layer.applyPreset(ffxFile);
        var numEffectsAfter = effects.numProperties;
        for (var i = numEffectsBefore + 1; i <= numEffectsAfter; i++) {
            var effect = effects.property(i);
            if (effect) {
                return effect;
            }
        }
        return -1;
    }

    function uniqueIndex(comp, inputNames) {
        var isArray = inputNames && typeof inputNames.length === 'number' && typeof inputNames !== 'string';
        if (!isArray) {
            inputNames = [inputNames];
        }

        var uniqueNames = inputNames.slice();
        var index = 1;
        var nameExists;
        var result = {};

        do {
            nameExists = false;
            for (var i = 0; i < uniqueNames.length; i++) {
                var currentName = uniqueNames[i] + (index > 1 ? " " + index : "");
                if (comp.layers.byName(currentName)) {
                    nameExists = true;
                    break;
                }
            }
            if (nameExists) {
                index++;
            }
        } while (nameExists);

        for (var i = 0; i < uniqueNames.length; i++) {
            var finalName = uniqueNames[i] + (index > 1 ? " " + index : "");
            result[uniqueNames[i]] = finalName;
        }

        return isArray ? result : result[inputNames[0]];
    }

    function uniqueIndexTwo(comp, inputName, currentLayer) {
        var index = 1;
        var nameExists;

        do {
            nameExists = false;
            var currentName = inputName + (index > 1 ? " " + index : "");
            for (var i = 1; i <= comp.numLayers; i++) {
                var layer = comp.layer(i);
                if (layer !== currentLayer && layer.name === currentName) {
                    nameExists = true;
                    break;
                }
            }
            if (nameExists) {
                index++;
            }
        } while (nameExists);

        return inputName + (index > 1 ? " " + index : "");
    }

    function getRandomNumber(min, max) {
        return Math.random() * (max - min) + min;
    }

    function effectsExistance(layer, effectsToCheck) {

        var isArray = effectsToCheck && typeof effectsToCheck.length === 'number' && typeof effectsToCheck !== 'string';
        if (!isArray) {
            effectsToCheck = [effectsToCheck];
        }

        var effects = layer.property("ADBE Effect Parade");
        var effectsExist = false;

        if (!layer.hasVideo) {
            return effectsExist;
        }

        for (var i = 0; i < effectsToCheck.length; i++) {
            for (var j = 1; j <= effects.numProperties; j++) {
                if (effects.property(j).name.indexOf(effectsToCheck[i]) !== -1) {
                    effectsExist = true;
                    break;
                }
            }
            if (effectsExist) {
                break;
            }
        }

        return effectsExist;
    }

    function bakeProjection(comp, layer) {

        // Deselect, uncollapse all, collapse all (prevents AE from crashing when deleting expression)
        app.executeCommand(2004);
        app.executeCommand(2771);
        app.executeCommand(2771);

        var positionProperty = layer.transform.position;
        var currentTime = comp.time;
        var hasExpression = false;

        // Check if position has an expression
        if (positionProperty.expression !== "") {
            hasExpression = true;

            // Bake position   
            if (positionProperty.numKeys > 0) {
                var currentValue = positionProperty.valueAtTime(currentTime, true);
                var newKeyIndex = positionProperty.addKey(currentTime);
                positionProperty.setValueAtKey(newKeyIndex, currentValue);
            } else {
                var currentValue = positionProperty.value;
                positionProperty.setValue(currentValue);

            }

            positionProperty.expression = '';
        }

        // Check if orientation has an expression
        try {
            var orientationProperty = layer.transform.orientation;
            if (orientationProperty.expression !== "") {
                hasExpression = true;

                // Bake orientation
                if (orientationProperty.numKeys > 0) {
                    var currentOrientation = orientationProperty.valueAtTime(currentTime, true);
                    var newOrientationKeyIndex = orientationProperty.addKey(currentTime);
                    orientationProperty.setValueAtKey(newOrientationKeyIndex, currentOrientation);
                } else {
                    var currentOrientation = orientationProperty.value;
                    orientationProperty.setValue(currentOrientation);
                }
                orientationProperty.expression = "";
            }
        } catch (e) {
            // Orientation property does not exist, do nothing
        }

        return hasExpression;
    }

    function deselectAll(comp) {
        var selectedLayers = comp.selectedLayers;
        for (var i = selectedLayers.length - 1; i >= 0; i--) {
            selectedLayers[i].selected = false;
        }
    }

    function alertPush(message) {
        alertMessage.push(message);
    }

    function alertShow(message) {

        alertMessage.push(message);

        if (alertMessage.length === 0) {
            return;
        }

        var allMessages = alertMessage.join("\n\n")

        var dialog = new Window("dialog", "Debug");
        var textGroup = dialog.add("group");
        textGroup.orientation = "column";
        textGroup.alignment = ["fill", "top"];

        var text = textGroup.add("edittext", undefined, allMessages, { multiline: true, readonly: true });
        text.alignment = ["fill", "fill"];
        text.preferredSize.width = 300;
        text.preferredSize.height = 300;

        var closeButton = textGroup.add("button", undefined, "Close");
        closeButton.onClick = function () {
            dialog.close();
        };

        dialog.show();

        alertMessage = [];

    }

    function alertCopy(message) {

        if (message === undefined || message === "") {
            return;
        }

        var dialog = new Window("dialog", "Information");
        var textGroup = dialog.add("group");
        textGroup.orientation = "column";
        textGroup.alignment = ["fill", "top"];

        var text = textGroup.add("edittext", undefined, message, { multiline: true, readonly: true });
        text.alignment = ["fill", "fill"];
        text.preferredSize.width = 300;
        text.preferredSize.height = 150;

        var closeButton = textGroup.add("button", undefined, "Close");
        closeButton.onClick = function () {
            dialog.close();
        };

        dialog.show();

        alertMessage = [];

    }

    // -------------------Show UI-------------------

    var myScriptPal = buildUI(thisObj);
    if ((myScriptPal != null) && (myScriptPal instanceof Window)) {
        myScriptPal.center();
        myScriptPal.show();
    }
    if (this instanceof Panel)
        myScriptPal.show();
}
DepthProjection(this);

// --------------------------------------
