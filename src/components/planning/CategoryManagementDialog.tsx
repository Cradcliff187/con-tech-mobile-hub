import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useCategoryManagement } from '@/hooks/useCategoryManagement';
import { Edit3, Trash2, Merge, BarChart3 } from 'lucide-react';

interface CategoryManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

export const CategoryManagementDialog: React.FC<CategoryManagementDialogProps> = ({
  open,
  onOpenChange,
  projectId
}) => {
  const { 
    isLoading, 
    getCategoryStats, 
    renameCategory, 
    deleteCategory, 
    mergeCategories, 
    getCategories 
  } = useCategoryManagement(projectId);

  const [activeTab, setActiveTab] = useState('stats');
  const [renameForm, setRenameForm] = useState({ oldName: '', newName: '' });
  const [deleteForm, setDeleteForm] = useState({ categoryName: '', reassignTo: '' });
  const [mergeForm, setMergeForm] = useState({ sourceCategories: [], targetCategory: '' });

  const categories = getCategories();
  const categoryStats = getCategoryStats();

  const handleRename = async () => {
    if (!renameForm.oldName || !renameForm.newName) return;
    
    const result = await renameCategory(renameForm.oldName, renameForm.newName);
    if (result.success) {
      setRenameForm({ oldName: '', newName: '' });
    }
  };

  const handleDelete = async () => {
    if (!deleteForm.categoryName) return;
    
    const result = await deleteCategory(
      deleteForm.categoryName, 
      deleteForm.reassignTo || undefined
    );
    if (result.success) {
      setDeleteForm({ categoryName: '', reassignTo: '' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 size={20} />
            Category Management
          </DialogTitle>
          <DialogDescription>
            Manage task categories for this project
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="rename">Rename</TabsTrigger>
            <TabsTrigger value="delete">Delete</TabsTrigger>
            <TabsTrigger value="merge">Merge</TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-4">
            <div className="grid gap-4">
              {categoryStats.map(stats => (
                <Card key={stats.name}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{stats.name}</span>
                      <Badge variant="outline">{stats.taskCount} tasks</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-green-600 font-medium">{stats.completedTasks}</div>
                        <div className="text-slate-500">Completed</div>
                      </div>
                      <div>
                        <div className="text-orange-600 font-medium">{stats.inProgressTasks}</div>
                        <div className="text-slate-500">In Progress</div>
                      </div>
                      <div>
                        <div className="text-red-600 font-medium">{stats.blockedTasks}</div>
                        <div className="text-slate-500">Blocked</div>
                      </div>
                      <div>
                        <div className="text-blue-600 font-medium">{stats.averageProgress}%</div>
                        <div className="text-slate-500">Avg Progress</div>
                      </div>
                    </div>
                    {(stats.totalEstimatedHours > 0 || stats.totalActualHours > 0) && (
                      <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="font-medium">{stats.totalEstimatedHours}h</div>
                          <div className="text-slate-500">Estimated</div>
                        </div>
                        <div>
                          <div className="font-medium">{stats.totalActualHours}h</div>
                          <div className="text-slate-500">Actual</div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="rename" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit3 size={20} />
                  Rename Category
                </CardTitle>
                <CardDescription>
                  Change the name of an existing category
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="oldCategoryName">Current Category</Label>
                  <Select 
                    value={renameForm.oldName} 
                    onValueChange={(value) => setRenameForm(prev => ({ ...prev, oldName: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category to rename" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="newCategoryName">New Name</Label>
                  <Input
                    id="newCategoryName"
                    value={renameForm.newName}
                    onChange={(e) => setRenameForm(prev => ({ ...prev, newName: e.target.value }))}
                    placeholder="Enter new category name"
                  />
                </div>

                <Button 
                  onClick={handleRename}
                  disabled={!renameForm.oldName || !renameForm.newName || isLoading}
                  className="w-full"
                >
                  {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                  Rename Category
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="delete" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <Trash2 size={20} />
                  Delete Category
                </CardTitle>
                <CardDescription>
                  Delete a category and optionally reassign its tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="deleteCategoryName">Category to Delete</Label>
                  <Select 
                    value={deleteForm.categoryName} 
                    onValueChange={(value) => setDeleteForm(prev => ({ ...prev, categoryName: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category to delete" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="reassignTo">Reassign Tasks To (Optional)</Label>
                  <Select 
                    value={deleteForm.reassignTo} 
                    onValueChange={(value) => setDeleteForm(prev => ({ ...prev, reassignTo: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Leave empty to delete tasks" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .filter(cat => cat !== deleteForm.categoryName)
                        .map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleDelete}
                  disabled={!deleteForm.categoryName || isLoading}
                  variant="destructive"
                  className="w-full"
                >
                  {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                  Delete Category
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="merge" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Merge size={20} />
                  Merge Categories
                </CardTitle>
                <CardDescription>
                  Combine multiple categories into one
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Source Categories (to be merged)</Label>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <div key={category} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`merge-${category}`}
                          checked={mergeForm.sourceCategories.includes(category)}
                          onChange={(e) => {
                            const updatedSources = e.target.checked
                              ? [...mergeForm.sourceCategories, category]
                              : mergeForm.sourceCategories.filter(c => c !== category);
                            setMergeForm(prev => ({ ...prev, sourceCategories: updatedSources }));
                          }}
                        />
                        <Label htmlFor={`merge-${category}`}>{category}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="targetCategory">Target Category</Label>
                  <Input
                    id="targetCategory"
                    value={mergeForm.targetCategory}
                    onChange={(e) => setMergeForm(prev => ({ ...prev, targetCategory: e.target.value }))}
                    placeholder="Enter target category name"
                  />
                </div>

                <Button 
                  onClick={() => mergeCategories(mergeForm.sourceCategories, mergeForm.targetCategory)}
                  disabled={mergeForm.sourceCategories.length === 0 || !mergeForm.targetCategory || isLoading}
                  className="w-full"
                >
                  {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                  Merge Categories
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};