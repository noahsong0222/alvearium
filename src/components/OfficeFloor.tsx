import { departments } from "../data/agents";
import { DepartmentZone } from "./DepartmentZone";

export function OfficeFloor() {
  return (
    <div className="floor-scroll">
      <div className="floor">
        {departments.map((dept) => (
          <DepartmentZone key={dept.name} department={dept} />
        ))}
      </div>
    </div>
  );
}
