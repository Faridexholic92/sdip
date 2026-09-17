export type RiskLevel="LOW"|"MODERATE"|"HIGH"|"CRITICAL";
export type HazardPoint={id:string;district:string;lat:number;lng:number;hazard:"Flood"|"Landslide"|"Storm";level:RiskLevel;confidence:number;radius:number};
export const hazardPoints:HazardPoint[]=[
{id:"sim-kk",district:"Kota Kinabalu",lat:5.9804,lng:116.0735,hazard:"Flood",level:"HIGH",confidence:68,radius:26000},
{id:"sim-ranau",district:"Ranau",lat:5.9536,lng:116.6641,hazard:"Landslide",level:"HIGH",confidence:72,radius:32000},
{id:"sim-sandakan",district:"Sandakan",lat:5.8402,lng:118.1179,hazard:"Flood",level:"HIGH",confidence:66,radius:30000},
{id:"sim-kinabatangan",district:"Kinabatangan",lat:5.4167,lng:117.5833,hazard:"Storm",level:"MODERATE",confidence:61,radius:36000},
{id:"sim-lahad-datu",district:"Lahad Datu",lat:5.0268,lng:118.3270,hazard:"Flood",level:"MODERATE",confidence:64,radius:25000}
];
export const districts=[
{name:"Ranau",flood:"Moderate",landslide:"High",storm:"Moderate",overall:"High",confidence:72},
{name:"Sandakan",flood:"High",landslide:"Moderate",storm:"High",overall:"High",confidence:68},
{name:"Kota Kinabalu",flood:"Low",landslide:"Low",storm:"Moderate",overall:"Moderate",confidence:75},
{name:"Lahad Datu",flood:"Moderate",landslide:"Low",storm:"Moderate",overall:"Moderate",confidence:64}
];
