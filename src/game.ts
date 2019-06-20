// custom component to handle opening and closing doors
@Component('doorState')
export class DoorState {
  closed: boolean = true
  fraction: number = 0
  closedPos: Vector3
  openPos: Vector3
  doorId: number
  constructor(closed: Vector3, open: Vector3, doorId: number){
    this.closedPos = closed
	this.openPos = open
	this.doorId = doorId
  }
}



// a group to keep track of all entities with a DoorState component
const doors = engine.getComponentGroup(DoorState)

// a message bus to sync state for all players
const sceneMessageBus = new MessageBus()


/// --- Define a custom type to pass in messages ---
type NewDoorState = {
	doorID: number,
	state: boolean
  };


// a system to carry out the opening of doors
export class OpenSystem implements ISystem {
 
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
engine.addSystem(new OpenSystem())

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
doorL.addComponent(new DoorState(new Vector3(0.5, 0, 0), new Vector3(1.25, 0, 0), 1))
engine.addEntity(doorL)

const doorR = new Entity()
doorR.addComponent(new Transform({
  position: new Vector3(-0.5, 0, 0),
  scale: new Vector3(1.1, 2, 0.05)
}))
doorR.addComponent(collideBox)
doorR.addComponent(new DoorState(new Vector3(-0.5, 0, 0), new Vector3(-1.25, 0, 0), 1))
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
  new OnClick(e => {
    openDoor(doorL)
  })
)

doorR.addComponent(
  new OnClick(e => {
   
    openDoor(doorR)
  })
)

function openDoor(door: IEntity){
  let currentState = door.getComponent(DoorState)
  let newState: NewDoorState = {
		doorID: 1,   
		state: !currentState.closed,
	  } 
  sceneMessageBus.emit("doorToggle", newState)  
}

  
  // To execute when a door is toggled
  sceneMessageBus.on("doorToggle", (info: NewDoorState) => {	
	for(let door of doors.entities){
		let state = door.getComponent(DoorState)
		if (state.doorId == info.doorID){
			state.closed = info.state
		}
		
	  }
  });
  
  // To get the initial state of the scene when joining
  sceneMessageBus.emit("getDoorState",{})
  
  // To return the initial state of the scene to new players
  sceneMessageBus.on("getDoorState", () => {
	  let currentState: NewDoorState = {
		   state: doorL.getComponent(DoorState).closed,
		   doorID: 1
		  } 
	  sceneMessageBus.emit("doorToggle", currentState)
  });
  




// ground
let floor = new Entity()
floor.addComponent(new GLTFShape("models/FloorBaseGrass.glb"))
floor.addComponent(new Transform({
  position: new Vector3(8, 0, 8), 
  scale:new Vector3(1.6, 0.1, 1.6)
}))
engine.addEntity(floor)