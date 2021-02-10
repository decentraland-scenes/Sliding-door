import * as utils from '@dcl/ecs-scene-utils'

// Define fixed walls
const wall1 = new Entity()
wall1.addComponent(
  new Transform({
    position: new Vector3(5.75, 1, 3),
    scale: new Vector3(1.5, 2, 0.1),
  })
)
wall1.addComponent(new BoxShape())
engine.addEntity(wall1)

const wall2 = new Entity()
wall2.addComponent(
  new Transform({
    position: new Vector3(2.25, 1, 3),
    scale: new Vector3(1.5, 2, 0.1),
  })
)
wall2.addComponent(new BoxShape())
engine.addEntity(wall2)

// Add the two sides to the door
const doorL = new Entity()
doorL.addComponent(
  new Transform({
    position: new Vector3(0.5, 0, 0),
    scale: new Vector3(1.1, 2, 0.05),
  })
)
doorL.addComponent(new BoxShape())
engine.addEntity(doorL)

const doorR = new Entity()
doorR.addComponent(
  new Transform({
    position: new Vector3(-0.5, 0, 0),
    scale: new Vector3(1.1, 2, 0.05),
  })
)
doorR.addComponent(new BoxShape())
engine.addEntity(doorR)

// Define a material to color the doors red
const doorMaterial = new Material()
doorMaterial.albedoColor = Color3.Red()
doorMaterial.metallic = 0.9
doorMaterial.roughness = 0.1

// Assign the material to the doors
doorL.addComponent(doorMaterial)
doorR.addComponent(doorMaterial)

// Define open and closed positions for both doors
let doorLClosed = new Vector3(0.5, 0, 0)
let doorLOpen = new Vector3(1.25, 0, 0)
let doorRClosed = new Vector3(-0.5, 0, 0)
let doorROpen = new Vector3(-1.25, 0, 0)

// This parent entity holds the state for both door sides
const doorParent = new Entity()
doorParent.addComponent(
  new Transform({
    position: new Vector3(4, 1, 3),
  })
)

//toggle behavior for door
doorParent.addComponent(
  new utils.ToggleComponent(utils.ToggleState.Off, (value) => {
    if (value == utils.ToggleState.On) {
      doorL.addComponentOrReplace(
        new utils.MoveTransformComponent(doorLClosed, doorLOpen, 1)
      )
      doorR.addComponentOrReplace(
        new utils.MoveTransformComponent(doorRClosed, doorROpen, 1)
      )
    } else {
      doorL.addComponentOrReplace(
        new utils.MoveTransformComponent(doorLOpen, doorLClosed, 1)
      )
      doorR.addComponentOrReplace(
        new utils.MoveTransformComponent(doorROpen, doorRClosed, 1)
      )
    }
  })
)

engine.addEntity(doorParent)

// Set the door as a child of doorPivot
doorL.setParent(doorParent)
doorR.setParent(doorParent)

// Set the click behavior for the door
doorL.addComponent(
  new OnPointerDown(
    (e) => {
      doorParent.getComponent(utils.ToggleComponent).toggle()
    },
    { button: ActionButton.POINTER, hoverText: 'Open/Close' }
  )
)

doorR.addComponent(
  new OnPointerDown(
    (e) => {
      doorParent.getComponent(utils.ToggleComponent).toggle()
    },
    { button: ActionButton.POINTER, hoverText: 'Open/Close' }
  )
)
