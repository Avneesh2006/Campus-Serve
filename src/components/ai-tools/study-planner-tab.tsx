"use client";

import * as React from "react";
import { Loader2, CalendarRange } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useStudyPlanner } from "@/hooks/use-study-planner";
import { ChatPanel } from "@/components/ai-tools/chat-panel";

export function StudyPlannerTab() {
  const [goal, setGoal] = React.useState("");
  const [daysAvailable, setDaysAvailable] = React.useState("7");
  const [hoursPerDay, setHoursPerDay] = React.useState("");
  const { generatePlan, isGenerating } = useStudyPlanner();
  const [hasGenerated, setHasGenerated] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!goal.trim() || !daysAvailable) return;
    const result = await generatePlan({
      goal,
      daysAvailable: Number(daysAvailable),
      hoursPerDay: hoursPerDay ? Number(hoursPerDay) : undefined,
    });
    if (result) {
      setHasGenerated(true);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <CalendarRange className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base">Study Planner</CardTitle>
              <CardDescription>
                Get a day-by-day plan based on your goal and upcoming assignments.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="goal">What do you want a plan for?</Label>
              <Textarea
                id="goal"
                placeholder="Prepare for my Operating Systems mid-semester exam"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="daysAvailable">Days available</Label>
                <Input
                  id="daysAvailable"
                  type="number"
                  min={1}
                  max={90}
                  value={daysAvailable}
                  onChange={(e) => setDaysAvailable(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hoursPerDay">Hours/day (optional)</Label>
                <Input
                  id="hoursPerDay"
                  type="number"
                  min={0.5}
                  max={16}
                  step="0.5"
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(e.target.value)}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Your current subjects and upcoming assignments are automatically factored in.
            </p>
            <Button type="submit" variant="brand" disabled={!goal.trim() || isGenerating}>
              {isGenerating && <Loader2 className="size-4 animate-spin" />}
              Generate plan
            </Button>
          </form>
        </CardContent>
      </Card>

      {hasGenerated && (
        <ChatPanel
          type="STUDY_PLANNER"
          emptyStateTitle="Your study plans"
          emptyStateDescription="Plans appear here, and you can ask to adjust them in the same thread."
          inputPlaceholder="Ask to adjust the plan..."
        />
      )}
    </div>
  );
}
