// custom component to handle opening and closing doors
@Component('doorState')
export class DoorState {
  closed: boolean = true
  fraction: number = 0
  L: Entity
  R: Entity
}

@Component('openDoor')
export class OpenDoor {
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
      let state = door.get(DoorState)
      // check if the rotation needs to be adjusted
      if (state.closed == false && state.fraction < 1) {
        state.fraction += dt
        updateDoors(door)
      } else if (state.closed == true && state.fraction > 0) {
        state.fraction -= dt
        updateDoors(door)   
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
wall1.set(new Transform({
  position: new Vector3(5.75, 1, 3),
  scale: new Vector3(1.5, 2, 0.1)
}))
wall1.set(collideBox)
engine.addEntity(wall1)

const wall2 = new Entity()
wall2.set(new Transform({
  position: new Vector3(2.25, 1, 3),
  scale: new Vector3(1.5, 2, 0.1)
}))
wall2.set(collideBox)
engine.addEntity(wall2)

// Add the two sides to the door
const doorL = new Entity()
doorL.set(new Transform({
  position: new Vector3(0.5, 0, 0),
  scale: new Vector3(1.1, 2, 0.05)
}))
doorL.set(collideBox)
doorL.set(new OpenDoor(new Vector3(0.5, 0, 0), new Vector3(1.25, 0, 0)))
engine.addEntity(doorL)

const doorR = new Entity()
doorR.set(new Transform({
  position: new Vector3(-0.5, 0, 0),
  scale: new Vector3(1.1, 2, 0.05)
}))
doorR.set(collideBox)
doorR.set(new OpenDoor(new Vector3(-0.5, 0, 0), new Vector3(-1.25, 0, 0)))
engine.addEntity(doorR)

// Define a material to color the door red
const doorMaterial = new Material()
doorMaterial.albedoColor = Color3.Red()
doorMaterial.metallic = 0.9
doorMaterial.roughness = 0.1

// Assign the material to the door
doorL.set(doorMaterial)
doorR.set(doorMaterial)

// This parent entity holds the state for both door sides
const doorParent = new Entity()
doorParent.set(new Transform({
  position: new Vector3(4, 1, 3)
}))
doorParent.set(new DoorState())
doorParent.get(DoorState).L = doorL
doorParent.get(DoorState).R = doorR
engine.addEntity(doorParent)

// Set the door as a child of doorPivot
doorL.setParent(doorParent)
doorR.setParent(doorParent)


// Set the click behavior for the door
doorL.set(
  new OnClick(e => {
    let state = doorL.getParent().get(DoorState)
    state.closed = !state.closed
  })
)

doorR.set(
  new OnClick(e => {
    let state = doorR.getParent().get(DoorState)
    state.closed = !state.closed
  })
)


function updateDoors(door: Entity){
  let s = door.get(DoorState)
  
  let lo = s.L.get(OpenDoor)
  let ro = s.R.get(OpenDoor)
  let lt = s.L.get(Transform)
  let rt = s.R.get(Transform)
  lt.position = Vector3.Lerp(lo.closedPos, lo.openPos, s.fraction)
  rt.position = Vector3.Lerp(ro.closedPos, ro.openPos, s.fraction)
}



