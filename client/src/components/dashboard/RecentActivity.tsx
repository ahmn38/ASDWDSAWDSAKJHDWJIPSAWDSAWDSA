import { useQuery } from "@tanstack/react-query";
import { Case, ActivityLog } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

export default function RecentActivity() {
  const { data: cases } = useQuery<Case[]>({
    queryKey: ["/api/cases"],
  });

  const caseId = cases?.[0]?.id;

  const { data: activities, isLoading } = useQuery<ActivityLog[]>({
    queryKey: ["/api/cases", caseId, "activities"],
    enabled: !!caseId,
  });

  if (isLoading || !caseId) {
    return (
      <Card>
        <CardContent className="pt-6">
          <h2 className="font-ibm-plex text-lg font-semibold text-[#212121] mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-100 h-16 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="font-ibm-plex text-lg font-semibold text-[#212121] mb-4">Recent Activity</h2>
        
        <div className="border-l-2 border-gray-200 pl-4 ml-4 space-y-6">
          {activities && activities.length > 0 ? (
            activities.map((activity) => (
              <div key={activity.id} className="relative">
                <div 
                  className={`absolute -left-6 top-0 w-4 h-4 rounded-full border-2 border-white ${
                    activity.activityType === "case_created" || activity.activityType === "case_updated"
                      ? "bg-[#0288D1]"
                      : activity.activityType === "evidence_added" || activity.activityType === "evidence_updated"
                      ? "bg-[#388E3C]"
                      : activity.activityType === "witness_added" || activity.activityType === "witness_updated"
                      ? "bg-[#D32F2F]"
                      : "bg-[#424242]"
                  }`}
                ></div>
                <div>
                  <div className="flex justify-between">
                    <h3 className="font-ibm-plex font-medium text-[#212121]">
                      {activity.activityType ? activity.activityType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Activity'}
                    </h3>
                    <span className="text-[#757575] text-xs">
                      {activity.createdAt ? formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true }) : 'Recently'}
                    </span>
                  </div>
                  <p className="text-sm text-[#757575] mb-1">By: Det. Sarah Johnson</p>
                  <p className="text-sm text-[#212121]">{activity.description}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-[#757575]">
              <p>No recent activity</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
