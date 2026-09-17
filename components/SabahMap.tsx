"use client";
import {useEffect,useRef} from "react";
import {hazardPoints} from "@/lib/mock-data";
const colors={LOW:"#72bc8f",MODERATE:"#eac26b",HIGH:"#de9255",CRITICAL:"#e97366"};
export default function SabahMap(){
 const node=useRef<HTMLDivElement>(null);
 useEffect(()=>{let map:any;let cancelled=false;(async()=>{
  if(!node.current)return; const L=await import("leaflet"); if(cancelled||!node.current)return;
  map=L.map(node.current,{minZoom:6,maxZoom:14,zoomControl:true}).setView([5.55,117.25],7);
  const tiles=process.env.NEXT_PUBLIC_MAP_TILE_URL||"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  L.tileLayer(tiles,{maxZoom:19,attribution:"&copy; OpenStreetMap contributors"}).addTo(map);
  hazardPoints.forEach(p=>{
   const c=colors[p.level];
   L.circle([p.lat,p.lng],{radius:p.radius,color:c,weight:1,fillColor:c,fillOpacity:.2}).addTo(map).bindPopup(`<b>${p.district}</b><br>${p.hazard} potential — ${p.level}<br><small>Confidence ${p.confidence}% · SIMULATED</small>`);
   L.circleMarker([p.lat,p.lng],{radius:7,color:"#fff",weight:3,fillColor:c,fillOpacity:1}).addTo(map);
  });
 })();return()=>{cancelled=true;if(map)map.remove()};},[]);
 return <div className="mapShell"><div ref={node} className="mapCanvas"/><div className="mapBadge">SIMULATED RISK DATA</div><div className="legend"><span><i className="low"/>Low</span><span><i className="moderate"/>Moderate</span><span><i className="high"/>High</span><span><i className="critical"/>Critical</span></div></div>
}
