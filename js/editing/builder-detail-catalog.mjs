export const DETAILED_LIBRARY_CREATORS=['addTree','addPond','addRocks','addBuilding','addPortal','addVolcano','addRainbowBridge','addCrystalCluster','addRocket','addSatellite','addRover','addSolarArray','addGreenhouse','addWindTurbine','addSolarPanels','addPowerLine','addBattery','addElectricCar','addRainGauge','addWeatherBalloon','addTornadoShelter','addLightningRod','addThermometer','addBridgeBeam','addSupportColumn','addRamp','addTestTower','buildPlantCell','buildAnimalCell','addCellWall','addCellMembrane','addNucleus','addDNA','addMitochondria','addChloroplast','addVacuoleSmall','addVacuoleLarge','addER','addRibosomes','addGolgi','addLysosome'];
export const DETAILED_MISSION_CREATORS=['buildCastle','buildPlayground','buildHabitat','buildDragonLair','buildFutureCity','buildSpaceColony','buildMoonColony','buildMarsColony','buildEnergyCity','buildWeatherWorld','buildEngineeringWorld','buildCellWorld'];
export function installDetailedCatalog({target,getBlocks,getScene,decorate,resolve}){
 for(const name of [...DETAILED_LIBRARY_CREATORS,...DETAILED_MISSION_CREATORS]){
  const original=target[name];if(typeof original!=='function'||original.detailedCatalog)continue;
  const wrapped=function(...args){
   const prior=target.builderDetailContext,before=new Set(getBlocks()),sceneBefore=new Set(getScene().children);
   const context={source:name,assembly:name+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8)};target.builderDetailContext=context;
   try{return original.apply(this,args);}finally{
    const decorateMesh=mesh=>{if(mesh.isMesh&&!mesh.userData.detailDecoration&&!mesh.userData.detailDecorated&&mesh.material?.color)decorate(mesh,{kind:resolve(mesh.material.color.getHex(),name),assembly:context.assembly});};
    for(const block of getBlocks())if(!before.has(block))decorateMesh(block);
    // Animated library assemblies such as turbine blades live outside the block list.
    if(DETAILED_LIBRARY_CREATORS.includes(name))for(const object of getScene().children)if(!sceneBefore.has(object)){const meshes=[];object.traverse(mesh=>{if(mesh.isMesh)meshes.push(mesh);});meshes.forEach(decorateMesh);}
    target.builderDetailContext=prior;
   }
  };wrapped.detailedCatalog=true;target[name]=wrapped;
 }
}
