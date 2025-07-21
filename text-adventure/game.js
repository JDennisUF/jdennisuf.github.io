class TextAdventure {
    constructor() {
        this.output = document.getElementById('output');
        this.cursor = document.getElementById('cursor');
        this.currentTypeInterval = null;
        this.gameState = {
            currentLocationId: null,
            inventory: [],
            health: 100,
            score: 0,
            gameStarted: false,
            currentMission: null,
            completedMissions: [],
            mainMissionUnlocked: false,
            visitedRooms: new Set()
        };
        this.worldMap = new Map(); // Persistent world storage
        this.nextLocationId = 1;
        
        this.setupKeyboardListeners();
        this.initialize();
    }

    initializeMap() {
        // Map rooms based on their actual directional connections
        // Start from room 1 (entrance) and map spatially
        this.roomPositions = {};
        this.calculateRoomPositions();
        this.createMapGrid();
    }
    
    calculateRoomPositions() {
        // Start mapping from entrance (room 1) at center of larger grid
        const visited = new Set();
        const queue = [{id: 1, x: 12, y: 12}]; // Start at center-bottom of 25x15 grid
        
        while (queue.length > 0) {
            const {id, x, y} = queue.shift();
            
            if (visited.has(id)) continue;
            visited.add(id);
            
            this.roomPositions[id] = {x, y};
            
            // Get room connections and map adjacent rooms
            if (this.worldMap.has(id)) {
                const room = this.worldMap.get(id);
                const connections = room.connections;
                
                // Process connections in a consistent order for predictable mapping
                const orderedDirections = ['north', 'east', 'south', 'west'];
                
                for (const direction of orderedDirections) {
                    const connectedId = connections[direction];
                    if (connectedId && !visited.has(connectedId) && !queue.find(item => item.id === connectedId)) {
                        let newX = x, newY = y;
                        
                        switch(direction) {
                            case 'north': newY = y - 1; break;
                            case 'south': newY = y + 1; break;
                            case 'east': newX = x + 1; break;
                            case 'west': newX = x - 1; break;
                        }
                        
                        // Make sure coordinates are within our 25x15 grid
                        if (newX >= 0 && newX < 25 && newY >= 0 && newY < 15) {
                            // Check if position is already occupied
                            const occupied = Object.values(this.roomPositions).some(pos => pos.x === newX && pos.y === newY);
                            if (!occupied) {
                                queue.push({id: connectedId, x: newX, y: newY});
                            } else {
                                // If position is occupied, try to find a nearby empty spot systematically
                                let foundSpot = false;
                                for (let distance = 1; distance <= 3 && !foundSpot; distance++) {
                                    for (let offsetY = -distance; offsetY <= distance && !foundSpot; offsetY++) {
                                        for (let offsetX = -distance; offsetX <= distance && !foundSpot; offsetX++) {
                                            if (Math.abs(offsetX) + Math.abs(offsetY) !== distance) continue;
                                            
                                            const tryX = newX + offsetX;
                                            const tryY = newY + offsetY;
                                            if (tryX >= 0 && tryX < 25 && tryY >= 0 && tryY < 15) {
                                                const stillOccupied = Object.values(this.roomPositions).some(pos => pos.x === tryX && pos.y === tryY);
                                                if (!stillOccupied) {
                                                    queue.push({id: connectedId, x: tryX, y: tryY});
                                                    foundSpot = true;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    createMapGrid() {
        const mapGrid = document.getElementById('map-grid');
        mapGrid.innerHTML = '';
        
        // Create cells in a 25x15 grid - all start empty
        for (let y = 0; y < 15; y++) {
            for (let x = 0; x < 25; x++) {
                const cell = document.createElement('div');
                cell.className = 'map-cell';
                cell.id = `map-cell-${x}-${y}`;
                
                // Find which room is in this position
                const roomId = this.getRoomAtPosition(x, y);
                if (roomId) {
                    cell.dataset.roomId = roomId;
                    // Don't show room number - leave blank until visited
                } else {
                    cell.style.visibility = 'hidden';
                }
                
                mapGrid.appendChild(cell);
            }
        }
    }
    
    getRoomAtPosition(x, y) {
        for (const [roomId, pos] of Object.entries(this.roomPositions)) {
            if (pos.x === x && pos.y === y) {
                return parseInt(roomId);
            }
        }
        return null;
    }
    
    updateMap() {
        // Clear all current highlighting
        document.querySelectorAll('.map-cell').forEach(cell => {
            cell.classList.remove('current', 'visited');
            cell.textContent = ''; // Clear any content
        });
        
        // Mark visited rooms with a marker
        this.gameState.visitedRooms.forEach(roomId => {
            const pos = this.roomPositions[roomId];
            if (pos) {
                const cell = document.getElementById(`map-cell-${pos.x}-${pos.y}`);
                if (cell && roomId !== this.gameState.currentLocationId) {
                    cell.classList.add('visited');
                    cell.textContent = '●'; // Mark visited rooms
                }
            }
        });
        
        // Mark current room with player icon
        const currentPos = this.roomPositions[this.gameState.currentLocationId];
        if (currentPos) {
            const currentCell = document.getElementById(`map-cell-${currentPos.x}-${currentPos.y}`);
            if (currentCell) {
                currentCell.classList.add('current');
                currentCell.textContent = '🧑'; // Cute player icon
            }
        } else {
            // Debug: log when player position is not found
            console.log(`Player position not found for room ${this.gameState.currentLocationId}`);
            console.log('Available room positions:', this.roomPositions);
        }
    }

    initialize() {
        this.clearScreen();
        this.typeColoredText(`
    ╔══════════════════════════════════════════════════════════════════════╗
    ║                       🔬 NEXUS RESEARCH FACILITY 🔬                  ║
    ║                          Emergency Protocol Active                   ║
    ╚══════════════════════════════════════════════════════════════════════╝
        `, 'text-cyan', 30);
        
        setTimeout(() => {
            this.typeColoredText(`
    [SYSTEM STATUS]: CONTAINMENT BREACH DETECTED
    [LOCATION]: Sector 7 - Experimental Division  
    [THREAT LEVEL]: `, 'text-red', 40);
            
            setTimeout(() => {
                this.typeColoredText(`CRITICAL`, 'text-red', 100);
                
                setTimeout(() => {
                    this.typeText(`
    
    You are a Security Response Specialist dispatched to the NEXUS 
    Research Facility following a catastrophic containment failure.
    
    The experimental entity in Sector 7 has breached its containment
    and is spreading through the facility. Your mission: contain the
    breach before it reaches the surface.
    
    Press SPACE to begin emergency protocols or H for help.
    `, 30);
                }, 1000);
            }, 500);
        }, 2000);
    }

    setupKeyboardListeners() {
        document.addEventListener('keydown', (event) => {
            this.handleKeyPress(event);
        });
    }

    handleKeyPress(event) {
        event.preventDefault();
        
        const key = event.key.toLowerCase();
        
        switch(key) {
            case ' ':
                if (!this.gameState.gameStarted) {
                    this.startGame();
                } else {
                    this.executeAction('use');
                }
                break;
            case 'arrowup':
                this.executeAction('north');
                break;
            case 'arrowdown':
                this.executeAction('south');
                break;
            case 'arrowleft':
                this.executeAction('west');
                break;
            case 'arrowright':
                this.executeAction('east');
                break;
            case 'i':
                this.showInventory();
                break;
            case 'l':
                this.lookAround();
                break;
            case 'h':
                this.showHelp();
                break;
            case 'm':
                console.log('M key pressed - showing mission status');
                this.showMissionStatus();
                break;
            case 'escape':
                this.showMenu();
                break;
            default:
                console.log('Default case triggered for key:', key);
                if (/^[a-z]$/.test(key)) {
                    // Special UI commands go to their own handlers, everything else goes to executeAction
                    if (['i', 'l', 'h', 'm'].includes(key)) {
                        console.log('Key ignored in default case (has specific handler):', key);
                    } else {
                        console.log('Executing action for key:', key);
                        this.executeAction(key);
                    }
                } else {
                    console.log('Non-letter key ignored:', key);
                }
                break;
        }
    }

    startGame() {
        this.gameState.gameStarted = true;
        this.clearScreen();
        
        this.typeColoredText(`
    ╔══════════════════════════════════════════════════════════════════════╗
    ║                     🚁 EMERGENCY INSERTION COMPLETE 🚁               ║
    ╚══════════════════════════════════════════════════════════════════════╝
        `, 'text-green', 30);
        
        setTimeout(() => {
            this.typeText(`
    Your transport drops you at the facility's emergency access point.
    The usual background hum of a functioning research station is absent,
    replaced by an ominous silence punctuated by distant mechanical groans.
    
    Emergency lighting casts everything in a sickly red glow. Your mission
    briefing was clear: restore containment protocols and secure the facility.
    
    First priority: establish power and communication links.
    
    Use arrow keys to move, T to take items, L to look around.
    Find data pads for mission briefings.
    `, 30);
            
            // Generate the entire facility map at game start
            this.generateFacilityMap();
            this.gameState.currentLocationId = 1; // Start at entrance
            this.gameState.visitedRooms.add(1); // Mark starting room as visited
            
            // Now that worldMap is generated, initialize the visual map
            this.initializeMap();
            
            setTimeout(() => {
                this.lookAround();
                this.showMissionStatus();
                this.updateMap(); // Initialize map display
            }, 3000);
        }, 2000);
    }

    generateFacilityMap() {
        // Create 30 locations with more interesting, loosely connected layout
        for (let i = 1; i <= 30; i++) {
            const location = this.generateLocation();
            location.id = i;
            location.connections = {};
            location.exits = [];
            this.worldMap.set(i, location);
        }
        
        // Define facility areas with specific connections
        this.createFacilityConnections();
        
        // Place mission-critical items strategically
        this.placeMissionItems();
    }
    
    createFacilityConnections() {
        // Define the facility as connected areas rather than a rigid grid
        const connections = [
            // Main Entrance Area (1-4)
            { from: 1, to: 2, dir: 'north' },   // Entrance -> Security Checkpoint
            { from: 2, to: 3, dir: 'east' },    // Security -> Main Corridor
            { from: 3, to: 4, dir: 'north' },   // Main Corridor -> Admin Wing
            
            // Research Wing (5-12)
            { from: 3, to: 5, dir: 'west' },    // Main Corridor -> Research Entry
            { from: 5, to: 6, dir: 'north' },   // Research Entry -> Lab A
            { from: 5, to: 7, dir: 'south' },   // Research Entry -> Lab B
            { from: 6, to: 8, dir: 'east' },    // Lab A -> Equipment Room
            { from: 7, to: 9, dir: 'west' },    // Lab B -> Storage
            { from: 8, to: 10, dir: 'north' },  // Equipment -> Control Room
            { from: 9, to: 11, dir: 'south' },  // Storage -> Clean Room
            { from: 10, to: 12, dir: 'west' },  // Control -> Observation
            
            // Engineering Section (13-20)
            { from: 4, to: 13, dir: 'east' },   // Admin -> Engineering Entry
            { from: 13, to: 14, dir: 'north' }, // Engineering Entry -> Workshop
            { from: 13, to: 15, dir: 'south' }, // Engineering Entry -> Maintenance
            { from: 14, to: 16, dir: 'east' },  // Workshop -> Parts Storage
            { from: 15, to: 17, dir: 'west' },  // Maintenance -> Utilities
            { from: 16, to: 18, dir: 'north' }, // Parts -> Tool Room
            { from: 17, to: 19, dir: 'south' }, // Utilities -> Power Grid
            { from: 18, to: 20, dir: 'west' },  // Tool Room -> Generator Room
            
            // Secure Wing (21-26)
            { from: 12, to: 21, dir: 'north' }, // Observation -> Secure Entry
            { from: 21, to: 22, dir: 'east' },  // Secure Entry -> Armory
            { from: 21, to: 23, dir: 'north' }, // Secure Entry -> Containment A
            { from: 22, to: 24, dir: 'south' }, // Armory -> Security Office
            { from: 23, to: 25, dir: 'east' },  // Containment A -> Containment B
            { from: 24, to: 26, dir: 'north' }, // Security -> Command Center
            
            // Sector 7 - Final Area (27-30)
            { from: 25, to: 27, dir: 'north' }, // Containment B -> Sector 7 Entry
            { from: 27, to: 28, dir: 'east' },  // Sector 7 Entry -> Reactor Core
            { from: 28, to: 29, dir: 'north' }, // Reactor Core -> Control Center
            { from: 29, to: 30, dir: 'west' },  // Control Center -> Emergency Exit
            
            // A few additional connections to prevent dead ends
            { from: 11, to: 15, dir: 'east' },  // Clean Room -> Maintenance
            { from: 19, to: 24, dir: 'north' }, // Power Grid -> Security Office
            { from: 26, to: 30, dir: 'east' },  // Command Center -> Emergency Exit
        ];
        
        // Apply all connections bidirectionally
        connections.forEach(conn => {
            const fromLoc = this.worldMap.get(conn.from);
            const toLoc = this.worldMap.get(conn.to);
            const oppositeDir = this.getOppositeDirection(conn.dir);
            
            fromLoc.connections[conn.dir] = conn.to;
            if (!fromLoc.exits.includes(conn.dir)) {
                fromLoc.exits.push(conn.dir);
            }
            
            toLoc.connections[oppositeDir] = conn.from;
            if (!toLoc.exits.includes(oppositeDir)) {
                toLoc.exits.push(oppositeDir);
            }
        });
    }

    placeMissionItems() {
        // Clear all items first
        this.worldMap.forEach(location => {
            location.items = [];
        });
        
        // Place 3 energy cells in different areas
        const energyCellLocations = [5, 12, 23];
        energyCellLocations.forEach(id => {
            const location = this.worldMap.get(id);
            location.items.push('energy cell');
        });
        
        // Place 1 access card
        const accessCardLocation = this.worldMap.get(18);
        accessCardLocation.items.push('access card');
        
        // Place 3 repair kits
        const repairKitLocations = [8, 15, 27];
        repairKitLocations.forEach(id => {
            const location = this.worldMap.get(id);
            location.items.push('repair kit');
        });
        
        // Place data pads with mission info in several locations
        const dataPadLocations = [3, 10, 20, 25];
        dataPadLocations.forEach(id => {
            const location = this.worldMap.get(id);
            location.items.push('data pad');
        });
        
        // Place a few other useful items
        const otherItemLocations = [
            { id: 7, item: 'flashlight' },
            { id: 14, item: 'medical kit' },
            { id: 22, item: 'tool kit' }
        ];
        otherItemLocations.forEach(({id, item}) => {
            const location = this.worldMap.get(id);
            location.items.push(item);
        });
    }

    generateLocation() {
        const locationTypes = [
            "Laboratory", "Corridor", "Control Room", "Storage Bay", "Reactor Chamber", 
            "Communications", "Medical Bay", "Armory", "Observation Deck", "Security Office"
        ];
        
        const adjectives = [
            "Abandoned", "Dark", "Flickering", "Emergency-lit", "Damaged", "Sealed", 
            "Contaminated", "Secure", "Underground", "High-security"
        ];
        
        const descriptions = {
            "Laboratory": [
                "Shattered glass and overturned equipment tell a story of hasty evacuation. Chemical residue stains the walls in unnatural colors, and emergency containment protocols flash on cracked monitors. The air tastes metallic.",
                "Experiment logs are scattered across workstations, pages torn and blood-stained. Specimen containers lie empty, their contents long escaped. A faint humming suggests some equipment still functions.",
                "Biosafety cabinets stand open and violated. Warning lights cast sickly shadows over abandoned research. You notice scratch marks on the reinforced glass - something wanted out very badly."
            ],
            "Corridor": [
                "Emergency lighting flickers irregularly, casting dancing shadows that make you question what's real. Blast doors hang partially open, their security systems clearly compromised. The silence is oppressive.",
                "Scorch marks streak the walls alongside deep gouges in the metal plating. Emergency oxygen masks dangle from overhead compartments. Your footsteps echo with unnatural resonance.",
                "Maintenance panels hang open, revealing severed cables and burnt circuitry. The air circulation system wheezes sporadically. Something moved in your peripheral vision."
            ],
            "Control Room": [
                "Banks of monitors display cascading error messages in red text. The main console bears signs of violent damage - someone or something didn't want the systems operational. Backup power hums uncertainly.",
                "System diagnostics paint a grim picture: multiple containment failures, life support compromised, security protocols offline. The command chair is overturned, and there are claw marks on the armrests.",
                "A massive display shows the facility layout with Sector 7 pulsing ominously red. Emergency broadcasts loop endlessly on silent screens. The smell of ozone and fear lingers in the stale air."
            ],
            "Storage Bay": [
                "Shipping containers lie torn open like tin cans, their contents spilled and scattered. Whatever was stored here is long gone, leaving only empty restraints and broken locks. The inventory system shows only error codes.",
                "Industrial shelving has been toppled in a pattern suggesting something large and angry passed through. Supply crates bear teeth marks. Emergency rations and medical supplies are conspicuously missing.",
                "Automated retrieval systems hang motionless, their mechanical arms frozen mid-reach. Loading dock doors are sealed, but you can see impact damage from the inside. Something wanted out."
            ],
            "Reactor Chamber": [
                "The fusion reactor pulses with contained energy, its magnetic fields crackling audibly. Radiation warnings flash in three languages. Coolant systems work overtime, and the temperature is uncomfortably warm.",
                "Warning lights pulse in rhythm with the reactor core. Automated safety systems announce containment status every thirty seconds. The air shimmers with heat distortion and electromagnetic interference.",
                "The reactor chamber hums with barely contained power. Diagnostic panels show fluctuating energy levels. You feel a subtle vibration in your bones - this much energy could level the facility."
            ],
            "Communications": [
                "Communication arrays stand twisted and broken, their dishes pointing at impossible angles. Message logs show increasingly desperate transmissions that cut off mid-sentence. The last entry is simply: 'It's loose.'",
                "Banks of radio equipment spark intermittently. Emergency broadcast loops fade in and out of static. You catch fragments: '...containment failure...' '...all personnel evacuate...' '...God help us all...'",
                "Satellite uplinks flicker with corrupted data streams. The main communication console has been smashed, possibly from the inside. Through the static, you hear what might be screaming."
            ],
            "Medical Bay": [
                "Medical equipment lies overturned and broken. Surgical instruments are scattered across the floor, some bearing dark stains. Bio-hazard containers have been forced open from within.",
                "Patient beds show signs of violent struggle - restraints torn and sheets shredded. Medical charts detail symptoms that defy classification. The air smells of antiseptic and something else.",
                "Emergency medical supplies have been ransacked. Diagnostic monitors show flatlined vital signs for patients no longer present. Scratch marks score the reinforced quarantine chamber walls."
            ],
            "Armory": [
                "Weapon racks stand empty, their locks forced and contents missing. Ammunition cases lie open and bare. Whatever the security teams faced, they took everything they could carry.",
                "Heavy weapons storage shows signs of desperate access - blast doors torn open, safes cracked. Tactical gear is scattered about. The weapons won't help against what's already inside.",
                "Equipment lockers hang open like broken mouths. Combat armor pieces are strewn across the floor, some bearing claw marks. The facility's defenders made their last stand here."
            ],
            "Observation Deck": [
                "Reinforced windows offer a view of the facility's lower levels. Emergency lights pulse in distant corridors. Something large moved across the view just as you looked.",
                "Observation equipment points inward rather than out - they were watching something inside. Monitoring stations show life signs that don't match human baselines. The readings are disturbing.",
                "Scientific observation logs document the 'specimen's' behavioral changes. The final entries describe increasing aggression and impossible physical adaptations. The viewing chamber below is empty."
            ],
            "Security Office": [
                "Security monitors display static-filled feeds from around the facility. Access logs show cascading system failures as something bypassed every safeguard. The last entry reads: 'All protocols have failed.'",
                "Keycard readers spark with electrical damage. The main security console has been torn apart - possibly from the outside, possibly from within. Emergency lockdown systems remain unresponsive.",
                "Surveillance footage loops endlessly, showing empty corridors that suddenly aren't empty. Motion sensors trigger randomly. The security grid has become unreliable since the breach."
            ]
        };
        
        // Simplified item list - only mission-critical and useful items
        const items = [
            "energy cell", "data pad", "access card", "repair kit", 
            "flashlight", "medical kit", "tool kit"
        ];
        
        const exits = [
            ["north", "south"], ["east", "west"], ["north", "east"], ["south", "west"],
            ["north", "south", "east"], ["north", "south", "west"], ["east", "west", "south"],
            ["north", "east", "west"], ["north", "south", "east", "west"]
        ];
        
        const locationType = locationTypes[Math.floor(Math.random() * locationTypes.length)];
        const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const name = `${adjective} ${locationType}`;
        
        const descriptionOptions = descriptions[locationType] || descriptions["Corridor"];
        const description = descriptionOptions[Math.floor(Math.random() * descriptionOptions.length)];
        
        // Items will be placed strategically, not randomly
        const locationItems = [];
        
        // Exits will be set by the map generation, not randomly
        const locationExits = [];
        
        return {
            name: name,
            description: description,
            exits: locationExits,
            items: locationItems,
            connections: {} // Will store direction -> locationId mappings
        };
    }

    executeAction(action) {
        if (!this.gameState.gameStarted) return;
        
        switch(action) {
            case 'north':
            case 'south':
            case 'east':
            case 'west':
                this.move(action);
                break;
            case 'use':
                this.typeText("\nWhat would you like to use? (Press a letter for items)");
                break;
            case 't':
                this.takeItem();
                break;
            case 'd':
                this.dropItem();
                break;
            default:
                this.tryQuickAction(action);
                break;
        }
    }

    takeItem() {
        const loc = this.worldMap.get(this.gameState.currentLocationId);
        if (loc.items.length === 0) {
            this.typeText("\nThere's nothing here to take.", 20);
            return;
        }
        
        const item = loc.items[0];
        loc.items.shift();
        this.gameState.inventory.push(item);
        this.typeText(`\nYou pick up the ${item}.`, 20);
        
        this.checkMissionProgress(item);
        
        if (loc.items.length > 0) {
            this.typeText(`\nThere are still items here: ${loc.items.join(", ")}`, 20);
        }
    }

    dropItem() {
        if (this.gameState.inventory.length === 0) {
            this.typeText("\nYou have nothing to drop.", 20);
            return;
        }
        
        const item = this.gameState.inventory.pop();
        const loc = this.worldMap.get(this.gameState.currentLocationId);
        loc.items.push(item);
        this.typeText(`\nYou drop the ${item}.`, 20);
    }



    tryQuickAction(action) {
        // Don't allow quick actions for reserved command keys
        if (['i', 'l', 'h', 'm', 't', 'd'].includes(action)) {
            return; // These are handled by specific key handlers or executeAction
        }
        
        if (this.gameState.inventory.length === 0) {
            this.typeText(`\nYou don't have anything to use with '${action.toUpperCase()}'.`);
            return;
        }
        
        const itemIndex = action.charCodeAt(0) - 97;
        if (itemIndex >= 0 && itemIndex < this.gameState.inventory.length) {
            const item = this.gameState.inventory[itemIndex];
            this.useItem(item);
        } else {
            this.typeText(`\nYou try '${action.toUpperCase()}' but nothing happens.`);
        }
    }

    useItem(item) {
        this.typeText(`\nYou use the ${item}...`, 30);
        
        const results = {
            "flashlight": "The flashlight illuminates dark corners, helping you see better.",
            "access card": "You swipe the access card - it grants access to secure areas.",
            "energy cell": "The energy cell powers up equipment. Mission progress: restore power grid.",
            "tool kit": "You use tools to repair systems. Useful for maintenance tasks.",
            "medical kit": "You treat your wounds. Health restored!",
            "data pad": "The data pad shows mission briefings and facility information.",
            "repair kit": "You use the repair kit on containment systems. Mission progress: field repairs."
        };
        
        const result = results[item] || "Nothing happens with this item here.";
        
        setTimeout(() => {
            this.typeText(`\n${result}`, 20);
            if (item === "medical kit") {
                this.gameState.health = Math.min(100, this.gameState.health + 25);
            }
            if (item === "data pad") {
                this.revealMissionObjective();
            }
        }, 1000);
    }

    revealMissionObjective() {
        if (!this.gameState.currentMission) {
            this.generateMission();
        }
        
        const mission = this.gameState.currentMission;
        const statusColor = mission.status === "CRITICAL" ? "text-red" : 
                          mission.status === "URGENT" ? "text-orange" :
                          mission.status === "HIGH PRIORITY" ? "text-yellow" : "text-cyan";
        
        // Calculate proper spacing for 68-character width content
        const missionText = `MISSION: ${mission.title}`;
        const statusText = `STATUS:  ${mission.status}`;
        const objectiveText = `OBJECTIVE: ${mission.objective}`;
        const rewardText = `REWARD: ${mission.reward}`;
        
        // Ensure spacing calculations don't go negative
        const missionSpacing = Math.max(0, 66 - missionText.length);
        const statusSpacing = Math.max(0, 66 - statusText.length);
        const descriptionSpacing = Math.max(0, 66 - mission.description.length);
        const objectiveSpacing = Math.max(0, 66 - objectiveText.length);
        const rewardSpacing = Math.max(0, 66 - rewardText.length);
        
        this.typeColoredText(`
    ╔══════════════════════════════════════════════════════════════════════╗
    ║                         ${mission.icon} MISSION BRIEFING ${mission.icon}                        ║
    ╠══════════════════════════════════════════════════════════════════════╣
    ║  ${missionText}${' '.repeat(missionSpacing)} ║
    ║  ${statusText}${' '.repeat(statusSpacing)} ║
    ║${' '.repeat(68)}║
    ║  ${mission.description}${' '.repeat(descriptionSpacing)} ║
    ║${' '.repeat(68)}║
    ║  ${objectiveText}${' '.repeat(objectiveSpacing)} ║
    ║  ${rewardText}${' '.repeat(rewardSpacing)} ║
    ╚══════════════════════════════════════════════════════════════════════╝
        `, statusColor);
    }

    generateMission() {
        const subMissions = [
            {
                id: 1,
                icon: "⚡",
                title: "POWER GRID STABILIZATION",
                description: "Backup power systems have failed. Emergency lighting and containment systems are offline.",
                objective: "Locate and install 3 energy cells in backup generators",
                type: "collection",
                target: "energy cell",
                requiredCount: 3,
                status: "CRITICAL",
                reward: "Emergency systems restored, blast doors unlocked"
            },
            {
                id: 2,
                icon: "🔐",
                title: "SECURITY CLEARANCE ACQUISITION",
                description: "Access to Sector 7 requires Dr. Morrison's Level-7 security clearance.",
                objective: "Find Dr. Morrison's office and retrieve his access credentials",
                type: "collection",
                target: "access card",
                requiredCount: 1,
                status: "HIGH PRIORITY",
                reward: "High-security areas accessible"
            },
            {
                id: 3,
                icon: "🛡️",
                title: "CONTAINMENT PROTOCOL ACTIVATION",
                description: "Containment field generators around Sector 7 are offline and need repair.",
                objective: "Activate 3 containment field generators using repair kits",
                type: "action",
                target: "repair kit",
                requiredCount: 3,
                status: "URGENT",
                reward: "Protective barriers established"
            }
        ];
        
        // Get next available mission in sequence
        const nextMission = subMissions.find(m => 
            !this.gameState.completedMissions.some(completed => completed.id === m.id)
        );
        
        if (nextMission) {
            this.gameState.currentMission = nextMission;
        } else if (!this.gameState.mainMissionUnlocked) {
            this.unlockMainMission();
        }
    }

    unlockMainMission() {
        this.gameState.mainMissionUnlocked = true;
        this.gameState.currentMission = {
            id: 4,
            icon: "🚨",
            title: "EMERGENCY LOCKDOWN INITIATION",
            description: "All containment prerequisites complete. The breach in Sector 7 must be contained before it reaches the surface.",
            objective: "Navigate to Sector 7 control center and initiate facility lockdown protocols",
            type: "final",
            target: "lockdown",
            requiredCount: 1,
            status: "FINAL PROTOCOL",
            reward: "Facility secured, evacuation possible"
        };
        
        this.typeColoredText(`
    ╔══════════════════════════════════════════════════════════════════════╗
    ║                    🚨 MAIN MISSION UNLOCKED 🚨                      ║
    ╠══════════════════════════════════════════════════════════════════════╣
    ║  All preparatory objectives complete. You may now proceed to Sector  ║
    ║  7 and initiate emergency lockdown protocols. WARNING: Sector 7      ║
    ║  containment breach is ACTIVE. Extreme caution advised.              ║
    ╚══════════════════════════════════════════════════════════════════════╝
        `, 'text-red', 30);
    }

    checkMissionProgress(item) {
        // Generate mission if we don't have one yet
        if (!this.gameState.currentMission) {
            this.generateMission();
        }
        
        const mission = this.gameState.currentMission;
        if (mission && (mission.type === "collection" || mission.type === "action") && item === mission.target) {
            const count = this.gameState.inventory.filter(i => i === mission.target).length;
            if (count >= mission.requiredCount) {
                this.completeMission();
            } else {
                this.typeText(`\nMission progress: ${count}/${mission.requiredCount} ${mission.target}s collected.`);
            }
        }
    }

    completeMission() {
        const mission = this.gameState.currentMission;
        this.gameState.completedMissions.push(mission);
        
        this.typeColoredText(`
    ╔══════════════════════════════════════════════════════════════════════╗
    ║                     ${mission.icon} MISSION COMPLETE ${mission.icon}                         ║
    ╠══════════════════════════════════════════════════════════════════════╣
    ║  ${mission.title.padEnd(66)} ║
    ║                                                                      ║
    ║  REWARD: ${mission.reward.padEnd(56)} ║
    ║  SCORE: +100 points                                                  ║
    ╚══════════════════════════════════════════════════════════════════════╝
        `, 'text-green', 30);
        
        this.gameState.score += 100;
        this.gameState.currentMission = null;
        
        // Check if other missions are already completed based on inventory
        this.checkAllMissionsCompletion();
        
        setTimeout(() => {
            this.showMissionStatus();
            if (this.gameState.completedMissions.length >= 3 && !this.gameState.mainMissionUnlocked) {
                setTimeout(() => {
                    this.unlockMainMission();
                }, 3000);
            }
        }, 2000);
    }
    
    checkAllMissionsCompletion() {
        const allMissions = [
            {
                id: 1,
                type: "collection",
                target: "energy cell",
                requiredCount: 3,
                title: "POWER GRID STABILIZATION"
            },
            {
                id: 2,
                type: "collection", 
                target: "access card",
                requiredCount: 1,
                title: "SECURITY CLEARANCE ACQUISITION"
            },
            {
                id: 3,
                type: "action",
                target: "repair kit", 
                requiredCount: 3,
                title: "CONTAINMENT PROTOCOL ACTIVATION"
            }
        ];
        
        allMissions.forEach(mission => {
            // Check if this mission is already completed
            const alreadyCompleted = this.gameState.completedMissions.some(completed => completed.id === mission.id);
            if (alreadyCompleted) return;
            
            // Check if player has enough items for this mission (works for both collection and action types)
            const count = this.gameState.inventory.filter(item => item === mission.target).length;
            if (count >= mission.requiredCount) {
                // Auto-complete this mission
                const completeMission = {
                    id: mission.id,
                    icon: mission.id === 1 ? "⚡" : mission.id === 2 ? "🔐" : "🛡️",
                    title: mission.title,
                    reward: "Auto-completed based on inventory"
                };
                
                this.gameState.completedMissions.push(completeMission);
                this.typeColoredText(`\n🎉 ${mission.title} - AUTO-COMPLETED! You already had the required items.`, 'text-yellow');
                this.gameState.score += 100;
            }
        });
    }

    move(direction) {
        const currentLoc = this.worldMap.get(this.gameState.currentLocationId);
        
        if (!currentLoc.exits.includes(direction)) {
            this.typeText(`\nYou can't go ${direction} from here.`, 20);
            return;
        }
        
        this.typeText(`\nYou move ${direction}...\n`, 30);
        
        setTimeout(() => {
            // Move to the connected location
            this.gameState.currentLocationId = currentLoc.connections[direction];
            this.gameState.visitedRooms.add(this.gameState.currentLocationId); // Track visited rooms
            this.lookAround();
            this.updateMap(); // Update map display
        }, 1000);
    }
    
    getOppositeDirection(direction) {
        const opposites = {
            'north': 'south',
            'south': 'north',
            'east': 'west',
            'west': 'east'
        };
        return opposites[direction];
    }

    lookAround() {
        const loc = this.worldMap.get(this.gameState.currentLocationId);
        let description = `\n=== ${loc.name} #${this.gameState.currentLocationId} ===\n`;
        description += `${loc.description}\n\n`;
        
        if (loc.items.length > 0) {
            description += "You see: " + loc.items.join(", ") + "\n";
        }
        
        description += "Exits: " + loc.exits.join(", ") + "\n";
        
        this.typeText(description, 20);
    }

    showInventory() {
        if (this.gameState.inventory.length === 0) {
            this.typeText("\nYour inventory is empty.", 20);
        } else {
            let inventoryText = "\nInventory:\n";
            this.gameState.inventory.forEach((item, index) => {
                const letter = String.fromCharCode(65 + index); // A, B, C, etc.
                inventoryText += `  [${letter}] ${item}\n`;
            });
            inventoryText += "\nPress the letter to use an item.";
            this.typeText(inventoryText, 20);
        }
    }

    showHelp() {
        this.typeColoredText(`
    ╔══════════════════════════ HELP ═══════════════════════════╗
    ║                    AVAILABLE COMMANDS                     ║
    ╠═══════════════════════════════════════════════════════════╣
    ║ ARROW KEYS: Move (North/South/East/West)                  ║
    ║ SPACE: Use/Interact with objects                          ║
    ║ T: Take items from location                               ║
    ║ D: Drop items from inventory                              ║
    ║ L: Look around current location                           ║
    ║ I: Check inventory                                        ║
    ║ M: Show mission status and progress                       ║
    ║ H: Show this help                                         ║
    ║ ESC: Game menu                                            ║
    ║                                                           ║
    ║ Letters A-Z: Quick item usage (A=first, B=second, etc.)  ║
    ║                                                           ║
    ║ 🎯 OBJECTIVE: Contain the Sector 7 breach. Find data     ║
    ║    pads for mission briefings. Complete sub-missions     ║
    ║    to unlock final containment protocol.                 ║
    ╚═══════════════════════════════════════════════════════════╝
        `, 'text-cyan', 20);
    }

    showMenu() {
        this.typeText(`
    === GAME MENU ===
    
    [R] Restart Game
    [S] Save Game (coming soon)
    [Q] Quit to Title
    
    Press any other key to continue...
    `, 20);
    }

    typeText(text, speed = 0) {
        // Clear any existing typing animation
        if (this.currentTypeInterval) {
            clearInterval(this.currentTypeInterval);
            this.currentTypeInterval = null;
        }
        
        // Instant text display - no animation
        this.output.textContent += text;
        this.scrollToBottom();
    }

    typeColoredText(text, colorClass = 'text-green', speed = 0) {
        // Clear any existing typing animation
        if (this.currentTypeInterval) {
            clearInterval(this.currentTypeInterval);
            this.currentTypeInterval = null;
        }
        
        const span = document.createElement('span');
        span.className = colorClass;
        span.style.whiteSpace = 'pre-wrap';
        span.textContent = text; // Instant text display
        this.output.appendChild(span);
        this.scrollToBottom();
    }

    showMissionStatus() {
        if (!this.gameState.currentMission) {
            this.generateMission();
        }
        
        const completed = this.gameState.completedMissions.length;
        const total = 3; // Number of sub-missions
        const progressPercent = (completed / total) * 100;
        
        const statusText = this.gameState.mainMissionUnlocked ? '🚨 FINAL PROTOCOL AVAILABLE' : '⚡ PREPARATORY PHASE';
        
        // Check if player has data pad in inventory
        const hasDataPad = this.gameState.inventory.includes('data pad');
        const currentObjective = hasDataPad ? 'Use data pad (press A) for mission details' : 'Find data pad for mission details';
        
        // Calculate proper spacing for 54-character width
        const completedText = `Sub-missions completed: ${completed}/${total}`;
        const progressText = `Progress: [${'█'.repeat(Math.floor(progressPercent/10))}${' '.repeat(10-Math.floor(progressPercent/10))}] ${Math.floor(progressPercent)}%`;
        const objectiveText = `Current Objective: ${currentObjective}`;
        const statusTextLine = `Status: ${statusText}`;
        
        // Ensure spacing calculations don't go negative
        const completedSpacing = Math.max(0, 52 - completedText.length);
        const progressSpacing = Math.max(0, 52 - progressText.length);
        const objectiveSpacing = Math.max(0, 52 - objectiveText.length);
        const statusSpacing = Math.max(0, 52 - statusTextLine.length);
        
        this.typeColoredText(`
    ╔══════════════════════════════════════════════════════╗
    ║ ${completedText}${' '.repeat(completedSpacing)} ║
    ║ ${progressText}${' '.repeat(progressSpacing)} ║
    ║${' '.repeat(54)}║
    ║ ${objectiveText}${' '.repeat(objectiveSpacing)} ║
    ║ ${statusTextLine}${' '.repeat(statusSpacing)} ║
    ╚══════════════════════════════════════════════════════╝
        `, 'text-cyan');
    }

    clearScreen() {
        this.output.textContent = '';
    }

    scrollToBottom() {
        this.output.scrollTop = this.output.scrollHeight;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TextAdventure();
});