import { PlatformIcon } from "@/components/icons/platform-icon";
import {
  DESTINATION_LIST,
  GROUP_META,
  GROUP_ORDER,
  type DestinationId,
} from "@/lib/destinations/registry";

/** Grouped checkbox chips for choosing destinations. Plain form inputs named "destinations". */
export function DestinationPicker({ selected }: { selected: DestinationId[] }) {
  return (
    <div className="space-y-5">
      {GROUP_ORDER.map((group) => {
        const items = DESTINATION_LIST.filter((d) => d.group === group);
        return (
          <fieldset key={group} className="space-y-2">
            <legend className="text-[0.9375rem] font-medium tracking-[-0.01em] text-foreground">{GROUP_META[group].title}</legend>
            <p className="text-xs text-muted-foreground">{GROUP_META[group].description}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {items.map((d) => (
                <label
                  key={d.id}
                  title={d.audience}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-sm font-medium text-muted-foreground transition-[color,background-color,border-color] duration-150 hover:border-foreground/25 hover:text-foreground has-checked:border-signal/30 has-checked:bg-signal/10 has-checked:text-signal has-focus-visible:ring-3 has-focus-visible:ring-ring/30"
                >
                  <input
                    type="checkbox"
                    name="destinations"
                    value={d.id}
                    defaultChecked={selected.includes(d.id)}
                    className="sr-only"
                  />
                  <PlatformIcon id={d.id} className="size-3.5" />
                  {d.label}
                </label>
              ))}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}
