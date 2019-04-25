// custom component to handle opening and closing doors
@Component('doorState')
export class DoorState {
  closed: boolean = true
  fraction: number = 0
  closedPos: Vector3
  openPos: Vector3
  constructor(closed: Vector3, open: Vector3){
    this.closedPos = closed
    this.openPos = open
  }
}


// a group to keep track of all entities with a DoorState component
const doors = engine.getComponentGroup(DoorState)

// a system to carry out the rotation
export class RotatorSystem implements ISystem {
 
  update(dt: number) {
    // iterate over the doors in the component group
    for (let door of doors.entities) {
      
      // get some handy shortcuts
      let state = door.getComponent(DoorState)
      let transform = door.getComponent(Transform)
      // check if the rotation needs to be adjusted
      if (state.closed == false && state.fraction < 1) {
        state.fraction += dt
        transform.position = Vector3.Lerp(state.closedPos, state.openPos, state.fraction)
      } else if (state.closed == true && state.fraction > 0) {
        state.fraction -= dt
        transform.position = Vector3.Lerp(state.closedPos, state.openPos, state.fraction)   
      }
    }
  }
}

// Add system to engine
engine.addSystem(new RotatorSystem())

// Define a reusable box shape
let collideBox = new BoxShape()
collideBox.withCollisions = true

// Define fixed walls
const wall1 = new Entity()
wall1.addComponent(new Transform({
  position: new Vector3(5.75, 1, 3),
  scale: new Vector3(1.5, 2, 0.1)
}))
wall1.addComponent(collideBox)
engine.addEntity(wall1)



const wall2 = new Entity()
wall2.addComponent(new Transform({
  position: new Vector3(2.25, 1, 3),
  scale: new Vector3(1.5, 2, 0.1)
}))
wall2.addComponent(collideBox)
engine.addEntity(wall2)

// Add the two sides to the door
const doorL = new Entity()
doorL.addComponent(new Transform({
  position: new Vector3(0.5, 0, 0),
  scale: new Vector3(1.1, 2, 0.05)
}))
doorL.addComponent(collideBox)
doorL.addComponent(new DoorState(new Vector3(0.5, 0, 0), new Vector3(1.25, 0, 0)))
engine.addEntity(doorL)

const doorR = new Entity()
doorR.addComponent(new Transform({
  position: new Vector3(-0.5, 0, 0),
  scale: new Vector3(1.1, 2, 0.05)
}))
doorR.addComponent(collideBox)
doorR.addComponent(new DoorState(new Vector3(-0.5, 0, 0), new Vector3(-1.25, 0, 0)))
engine.addEntity(doorR)

// Define a material to color the door red
const doorMaterial = new Material()
doorMaterial.albedoColor = Color3.Red()
doorMaterial.metallic = 0.9
doorMaterial.roughness = 0.1

// Assign the material to the door
doorL.addComponent(doorMaterial)
doorR.addComponent(doorMaterial)

// This parent entity holds the state for both door sides
const doorParent = new Entity()
doorParent.addComponent(new Transform({
  position: new Vector3(4, 1, 3)
}))
engine.addEntity(doorParent)

// Set the door as a child of doorPivot
doorL.setParent(doorParent)
doorR.setParent(doorParent)


// Set the click behavior for the door
doorL.addComponent(
  new OnPointerDown(e => {
    let parent = doorL.getParent()
    openDoor(parent)
  })
)

doorR.addComponent(
  new OnPointerDown(e => {
    let parent = doorR.getParent()
    openDoor(parent)
  })
)

function openDoor(parent: Entity){
  for(let id in parent.children){
    const child = parent.children[id]
    let state = child.getComponent(DoorState)
    state.closed = !state.closed
  }   
}




