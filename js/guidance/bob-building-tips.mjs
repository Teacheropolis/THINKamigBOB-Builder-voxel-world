const general=['Start with a wide base. Can your tallest part stand steady?','Look from another side. What could you improve?','Try one small change. Undo can bring it back!','Leave a path wide enough for BOB to explore.'];
const missions=[
 [/castle/i,['Build a gate tall enough for visitors.','Try a wide wall base and a lookout tower.','How could a bridge help people reach your castle?']],
 [/playground/i,['Give each play area a safe landing space.','Can you connect two play areas with a path?','Try a gentle ramp beside your steps.']],
 [/habitat/i,['Give your creature food, water, and shelter.','Connect your habitat areas with a clear path.','Where could an animal hide or rest?']],
 [/dragon/i,['Make an entrance big enough for your dragon!','Try a rocky shelter with space to turn around.','Where would your dragon keep its treasure?']],
 [/future|city|energy/i,['Connect homes to a source of energy.','Leave room for roads and walking paths.','How could your city use energy from the sun or wind?']],
 [/weather/i,['Put weather tools where buildings will not block them.','Build a safe shelter near your weather station.','How could you collect and compare weather measurements?']],
 [/moon|mars|space|colony/i,['Connect living areas to a safe airlock.','Where will astronauts get food, water, and energy?','Build a rover path between your science stations.']],
 [/engineer/i,['Try adding supports under a long span.','Compare a wide base with a narrow base.','Change one part, then explain why it is stronger.']],
 [/cell/i,['Keep the nucleus inside the cell boundary.','Give each cell part a place and a job.','Can you show how materials enter and leave your cell?']]
];
const objects=[
 [/tree|foliage/i,['Your leafy blocks could make a shady resting spot.','Leave a path between your trees.']],
 [/water|pond/i,['You have water. Could you add a bank or a bridge?','Make a safe path around your water.']],
 [/wood/i,['Your wooden pieces could form a deck, beam, or shelter.']],
 [/stone|rock/i,['Try using your stone or rock pieces as strong supports.']],
 [/solar|turbine|battery/i,['Connect your energy equipment to something that uses power.']],
 [/rocket|rover|satellite/i,['Make a clear launch or travel area for your space equipment.']],
 [/biology|cell|nucleus/i,['Look at your cell parts. Which job does each one do?']],
 [/door/i,['Test your door in Explore. Is there room on both sides?']],
 [/glass/i,['Your glass pieces could make windows for a lookout.']],
 [/metal/i,['Try using your metal pieces to frame a machine or tower.']],
 [/lava/i,['Keep a safe viewing path around your lava.']]
];
export function buildingTipPool(mission='',features=[]){const text=features.join(' ');return [...new Set([...general,...missions.filter(([pattern])=>pattern.test(mission)).flatMap(([,tips])=>tips),...objects.filter(([pattern])=>pattern.test(text)).flatMap(([,tips])=>tips)])];}
export function nextBuildingTip(pool,previous='',random=Math.random){const choices=pool.filter(tip=>tip!==previous);return choices[Math.min(choices.length-1,Math.floor(random()*choices.length))]||pool[0]||general[0];}
