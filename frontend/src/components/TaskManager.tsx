
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { Task } from '@/types/workflows';
import TaskActionModal from './TaskActionModal';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  RefreshCw,
  Search, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Eye,
  Calendar,
  Layers,
  ChevronRight,
  Inbox,
  Filter
} from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { format } from 'date-fns';

const TaskManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const { data: tasks, isLoading, error, refetch } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => apiClient<Task[]>('/tasks'),
  });

  const handleViewActionTask = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
    refetch(); // Refresh after action
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none font-bold">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-none font-bold">In Progress</Badge>;
      case 'assigned':
        return <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-none font-bold">Assigned</Badge>;
      case 'failed':
        return <Badge className="bg-rose-50 text-rose-700 hover:bg-rose-100 border-none font-bold">Failed</Badge>;
      default:
        return <Badge variant="outline" className="text-gray-500 font-bold">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'failed': return <AlertCircle className="h-5 w-5 text-rose-500" />;
      default: return <Clock className="h-5 w-5 text-indigo-500 animate-pulse" />;
    }
  };

  const filteredTasks = tasks
    ?.filter(task => {
      if (activeTab === 'all') return true;
      if (activeTab === 'in_progress' && (task.status === 'in_progress' || task.status === 'assigned')) return true;
      return task.status === activeTab;
    })
    .filter(task =>
      (task.step_name_in_workflow?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.workflow_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.task_id.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <Inbox className="h-8 w-8 text-indigo-600" /> Task Inbox
          </h2>
          <p className="text-gray-500 mt-1">Manage and respond to required human interventions.</p>
        </div>
        <Button variant="outline" onClick={() => refetch()} className="h-11 px-6 rounded-xl border-gray-200">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Sync Tasks
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search tasks, workflows, or IDs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 bg-white border-gray-200 rounded-xl"
          />
        </div>
        <Button variant="outline" className="h-12 px-6 rounded-xl border-gray-200">
          <Filter className="h-4 w-4 mr-2 text-gray-500" />
          Filter
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="bg-gray-100 p-1 rounded-xl mb-6">
          <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 font-bold">All</TabsTrigger>
          <TabsTrigger value="pending" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 font-bold text-gray-500 data-[state=active]:text-indigo-600">Pending</TabsTrigger>
          <TabsTrigger value="in_progress" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 font-bold text-gray-500 data-[state=active]:text-indigo-600">Active</TabsTrigger>
          <TabsTrigger value="completed" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 font-bold text-gray-500 data-[state=active]:text-indigo-600">Done</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0 space-y-4 outline-none">
          {isLoading ? (
             <div className="space-y-4">
                {[1,2,3].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
            </div>
          ) : error ? (
             <div className="p-8 bg-rose-50 rounded-2xl border border-rose-100 text-rose-800">
                <p className="font-bold flex items-center gap-2"><AlertCircle className="h-5 w-5" /> Connection Failed</p>
                <p className="text-sm opacity-80 mt-1">Unable to sync with the task registry. Please try again later.</p>
            </div>
          ) : filteredTasks?.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-2xl ring-1 ring-gray-100">
                <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-indigo-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">All caught up!</h3>
                <p className="text-gray-500 mt-1">No tasks found matching your current filter.</p>
            </div>
          ) : (
            filteredTasks?.map((task) => (
              <Card key={task.task_id} className="group hover:ring-2 hover:ring-indigo-500 transition-all duration-300 border-none bg-white shadow-sm hover:shadow-lg rounded-2xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="p-6 flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
                            {getStatusIcon(task.status)}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-lg text-gray-900">{task.step_name_in_workflow}</h3>
                                {getStatusBadge(task.status)}
                            </div>
                            <div className="flex items-center gap-4 mt-1">
                                <span className="flex items-center text-xs text-gray-500 font-medium">
                                    <Layers className="h-3 w-3 mr-1" /> {task.workflow_name || 'System Task'}
                                </span>
                                <span className="flex items-center text-xs text-gray-500 font-medium">
                                    <span className="bg-gray-200 h-1 w-1 rounded-full mr-2" /> ID: {task.run_id.substring(0,8)}
                                </span>
                            </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <div>
                                <p className="text-[10px] font-black uppercase text-gray-400 leading-none">Created</p>
                                <p className="text-sm font-semibold text-gray-700">{format(new Date(task.created_at), "MMM d, HH:mm")}</p>
                            </div>
                        </div>
                        {task.deadline_at && (
                            <div className="flex items-center gap-3">
                                <Clock className={`h-4 w-4 ${new Date(task.deadline_at) < new Date() && task.status !== 'completed' ? 'text-rose-500' : 'text-gray-400'}`} />
                                <div>
                                    <p className="text-[10px] font-black uppercase text-gray-400 leading-none">Deadline</p>
                                    <p className={`text-sm font-semibold ${new Date(task.deadline_at) < new Date() && task.status !== 'completed' ? 'text-rose-600' : 'text-gray-700'}`}>
                                        {format(new Date(task.deadline_at), "MMM d, HH:mm")}
                                    </p>
                                </div>
                            </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 md:w-48 p-6 flex items-center justify-center border-t md:border-t-0 md:border-l border-gray-100 group-hover:bg-indigo-50/30 transition-colors">
                      <Button
                        onClick={() => handleViewActionTask(task)}
                        className="w-full h-11 bg-white hover:bg-indigo-600 text-indigo-600 hover:text-white font-bold rounded-xl border border-indigo-100 shadow-sm transition-all"
                      >
                        Action <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      <TaskActionModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onTaskCompleted={() => {}}
      />
    </div>
  );
};

export default TaskManager;
