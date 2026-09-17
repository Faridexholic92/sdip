export type RiskInputs={hazard:number;exposure:number;vulnerability:number;capacity:number;completeness:number;freshness:number;authority:number;spatialPrecision:number;validation:number};
const clamp=(n:number)=>Math.max(0,Math.min(100,n));
export function calculateRisk(i:RiskInputs){
 const score=clamp(.45*i.hazard+.20*i.exposure+.25*i.vulnerability-.10*i.capacity);
 const confidence=clamp(.35*i.completeness+.25*i.freshness+.20*i.authority+.10*i.spatialPrecision+.10*i.validation);
 const level=score>=75?"CRITICAL":score>=50?"HIGH":score>=25?"MODERATE":"LOW";
 return {score:Math.round(score),confidence:Math.round(confidence),level,modelVersion:"sdip-risk-v0.1"};
}
