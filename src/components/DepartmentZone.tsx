import type { Department } from "../types";
import { Desk } from "./Desk";

interface Props {
  department: Department;
}

export function DepartmentZone({ department }: Props) {
  return (
    <section className="zone" style={{ ["--dept" as string]: department.color }}>
      <div className="zone-glow" />
      <div className="zone-header">
        <span className="chip" />
        <span className="name">{department.name}</span>
        <span className="count">{department.agents.length}</span>
      </div>
      <div className="desks">
        {department.agents.map((agent, i) => (
          <Desk key={agent.id} agent={agent} index={i} />
        ))}
      </div>
    </section>
  );
}
