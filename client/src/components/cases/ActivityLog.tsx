import { useQuery } from "@tanstack/react-query";
import { ActivityLog as ActivityLogType } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

interface CaseActivityLogProps {
  caseId: number;
}

export default function CaseActivityLog({ caseId }: CaseActivityLogProps) {
  const [filter, setFilter] = useState("all");
  
  const { data: activities, isLoading } = useQuery<ActivityLogType[]>({
    queryKey: [`/api/cases/${caseId}/activities`],
  });

  // Filter activities based on selected filter
  const filteredActivities = activities?.filter(activity => {
    if (filter === "all") return true;
    if (filter === "evidence" && activity.activityType.includes("evidence")) return true;
    if (filter === "witness" && activity.activityType.includes("witness")) return true;
    if (filter === "case" && activity.activityType.includes("case")) return true;
    if (filter === "ai" && activity.activityType.includes("ai")) return true;
    return false;
  });

  const getActivityIcon = (type: string) => {
    if (type.includes("evidence")) return "inventory_2";
    if (type.includes("witness")) return "people";
    if (type.includes("case")) return "folder";
    if (type.includes("ai")) return "psychology";
    return "event_note";
  };

  const getActivityColor = (type: string) => {
    if (type.includes("evidence")) return "bg-[#388E3C]";
    if (type.includes("witness")) return "bg-[#D32F2F]";
    if (type.includes("case")) return "bg-[#0288D1]";
    if (type.includes("ai")) return "bg-[#0288D1]";
    return "bg-[#424242]";
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-ibm-plex text-lg font-semibold text-[#212121]">Activity Log</h2>
          </div>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-ibm-plex text-lg font-semibold text-[#212121]">Activity Log</h2>
          <div className="flex items-center">
            <span className="text-[#757575] text-sm mr-2">Filter by:</span>
            <select 
              className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A237E] focus:border-transparent"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Activities</option>
              <option value="evidence">Evidence</option>
              <option value="witness">Witness</option>
              <option value="case">Case Updates</option>
              <option value="ai">AI Analysis</option>
            </select>
          </div>
        </div>
        
        <div className="border-l-2 border-gray-200 pl-4 ml-4 space-y-6">
          {filteredActivities && filteredActivities.length > 0 ? (
            filteredActivities.map((activity) => (
              <div key={activity.id} className="relative">
                <div className={`absolute -left-6 top-0 w-4 h-4 rounded-full ${getActivityColor(activity.activityType)} border-2 border-white`}></div>
                <div>
                  <div className="flex justify-between">
                    <h3 className="font-ibm-plex font-medium text-[#212121]">
                      {activity.activityType ? activity.activityType.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Activity'}
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
            <div className="text-center py-8 text-[#757575]">
              <span className="material-icons mb-2">history</span>
              <p>No activity logs found with the current filter</p>
            </div>
          )}
          
          {filteredActivities && filteredActivities.length > 5 && (
            <button className="w-full py-2 mt-2 border border-gray-200 text-[#757575] rounded-md text-sm hover:text-[#1A237E] hover:border-[#1A237E] transition-all duration-200">
              Load More Activities
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
