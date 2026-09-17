import { ArrowRight } from "@phosphor-icons/react";
import { bwBrain } from "../data/bwBrain.js";

export function BrainRelationship() {
  return <div className="brain-relationship" aria-label="基础模型支撑智能体">
    <div className="brain-relationship__model"><strong>{bwBrain.modelName}</strong><span>{bwBrain.modelRole}</span></div>
    <div className="brain-relationship__support"><span>支撑</span><ArrowRight size={24} aria-hidden="true" /></div>
    <div className="brain-relationship__agent"><h3>{bwBrain.name}</h3><span>{bwBrain.role}</span><p>{bwBrain.description}</p></div>
  </div>;
}
