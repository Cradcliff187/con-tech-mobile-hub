
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  AlertCircle, 
  CheckCircle, 
  Info, 
  Upload, 
  Download, 
  Settings, 
  Users, 
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Calendar,
  Home,
  Building,
  Hammer
} from 'lucide-react';

const ComponentShowcase = () => {
  const [progressValue, setProgressValue] = useState(65);
  const [switchValue, setSwitchValue] = useState(false);
  const [checkboxValue, setCheckboxValue] = useState(false);

  const codeExample = (component: string, example: string) => (
    <div className="mt-4 p-4 bg-slate-50 rounded-lg border">
      <p className="text-sm font-medium text-slate-700 mb-2">Usage Example:</p>
      <code className="text-sm text-slate-600 whitespace-pre-wrap">
        {example}
      </code>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <PageHeader
          title="Component Showcase"
          description="A comprehensive documentation of all UI components used in the construction management application"
          badge={{ text: "Design System", variant: "outline" }}
          meta={[
            { label: "Components", value: "25+", icon: <Building size={16} /> },
            { label: "Categories", value: "8", icon: <FileText size={16} /> }
          ]}
        />

        <Tabs defaultValue="buttons" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="buttons">Buttons</TabsTrigger>
            <TabsTrigger value="forms">Forms</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="navigation">Navigation</TabsTrigger>
            <TabsTrigger value="layout">Layout</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="specialized">Specialized</TabsTrigger>
          </TabsList>

          <TabsContent value="buttons" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Button Components</CardTitle>
                <CardDescription>Interactive elements for user actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold mb-4">Button Variants</h4>
                  <div className="flex flex-wrap gap-4">
                    <Button variant="default">Default</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="link">Link</Button>
                    <Button variant="destructive">Destructive</Button>
                  </div>
                  {codeExample('Button', `<Button variant="default">Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>`)}
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-4">Button Sizes</h4>
                  <div className="flex flex-wrap gap-4 items-center">
                    <Button size="sm">Small</Button>
                    <Button size="default">Default</Button>
                    <Button size="lg">Large</Button>
                    <Button size="icon"><Settings size={16} /></Button>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-4">Button States</h4>
                  <div className="flex flex-wrap gap-4">
                    <Button disabled>Disabled</Button>
                    <Button className="opacity-50 cursor-wait">Loading</Button>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline">
                            <Upload size={16} className="mr-2" />
                            With Icon
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Upload files</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Form Components</CardTitle>
                <CardDescription>Input elements for data collection</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="text-input">Text Input</Label>
                      <Input id="text-input" placeholder="Enter text..." />
                    </div>
                    
                    <div>
                      <Label htmlFor="select">Select Dropdown</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select option..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="option1">Option 1</SelectItem>
                          <SelectItem value="option2">Option 2</SelectItem>
                          <SelectItem value="option3">Option 3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="textarea">Textarea</Label>
                      <Textarea id="textarea" placeholder="Enter description..." />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="checkbox" 
                        checked={checkboxValue}
                        onCheckedChange={setCheckboxValue}
                      />
                      <Label htmlFor="checkbox">Checkbox Option</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="switch"
                        checked={switchValue}
                        onCheckedChange={setSwitchValue}
                      />
                      <Label htmlFor="switch">Toggle Switch</Label>
                    </div>

                    <div>
                      <Label>Progress Indicator</Label>
                      <Progress value={progressValue} className="mt-2" />
                      <p className="text-sm text-slate-500 mt-1">{progressValue}% complete</p>
                    </div>
                  </div>
                </div>
                {codeExample('Form Components', `<Label htmlFor="input">Label</Label>
<Input id="input" placeholder="Placeholder..." />

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option">Option</SelectItem>
  </SelectContent>
</Select>`)}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Display Components</CardTitle>
                <CardDescription>Components for displaying structured information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold mb-4">Badges</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="default">Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-4">Avatar</h4>
                  <div className="flex gap-4 items-center">
                    <Avatar>
                      <AvatarImage src="https://github.com/shadcn.png" alt="Avatar" />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <Avatar>
                      <AvatarFallback>AB</AvatarFallback>
                    </Avatar>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-4">Loading States</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <LoadingSpinner size="sm" />
                      <LoadingSpinner size="md" />
                      <LoadingSpinner size="lg" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[150px]" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Feedback Components</CardTitle>
                <CardDescription>Components for user feedback and notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold mb-4">Alerts</h4>
                  <div className="space-y-4">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>Information</AlertTitle>
                      <AlertDescription>
                        This is an informational alert message.
                      </AlertDescription>
                    </Alert>

                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-800">Success</AlertTitle>
                      <AlertDescription className="text-green-700">
                        Operation completed successfully.
                      </AlertDescription>
                    </Alert>

                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>
                        Something went wrong. Please try again.
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-4">Empty States</h4>
                  <div className="border rounded-lg p-4">
                    <EmptyState
                      icon={<FileText size={48} className="text-slate-400" />}
                      title="No documents found"
                      description="Upload your first document to get started with project documentation."
                      actionLabel="Upload Document"
                      onAction={() => console.log('Upload clicked')}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="navigation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Navigation Components</CardTitle>
                <CardDescription>Components for navigation and wayfinding</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold mb-4">Tabs</h4>
                  <Tabs defaultValue="tab1" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="tab1">Overview</TabsTrigger>
                      <TabsTrigger value="tab2">Details</TabsTrigger>
                      <TabsTrigger value="tab3">Settings</TabsTrigger>
                    </TabsList>
                    <TabsContent value="tab1" className="mt-4 p-4 border rounded-lg">
                      <p>Overview content goes here...</p>
                    </TabsContent>
                    <TabsContent value="tab2" className="mt-4 p-4 border rounded-lg">
                      <p>Details content goes here...</p>
                    </TabsContent>
                    <TabsContent value="tab3" className="mt-4 p-4 border rounded-lg">
                      <p>Settings content goes here...</p>
                    </TabsContent>
                  </Tabs>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-4">Tooltips</h4>
                  <TooltipProvider>
                    <div className="flex gap-4">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="icon">
                            <Home size={16} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Go to Dashboard</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="icon">
                            <Search size={16} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Search projects</p>
                          <p className="text-xs text-slate-400">Ctrl+K</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="layout" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Layout Components</CardTitle>
                <CardDescription>Structural components for page organization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold mb-4">Cards</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Basic Card</CardTitle>
                        <CardDescription>Simple card with header</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p>Card content goes here...</p>
                      </CardContent>
                    </Card>

                    <Card className="border-blue-200 bg-blue-50">
                      <CardHeader>
                        <CardTitle className="text-blue-800">Highlighted Card</CardTitle>
                        <CardDescription className="text-blue-600">
                          Card with custom styling
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-blue-700">Special content...</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-4">Separators</h4>
                  <div className="space-y-4">
                    <div>
                      <p>Content above separator</p>
                      <Separator className="my-4" />
                      <p>Content below separator</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Components</CardTitle>
                <CardDescription>Components for displaying content and media</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold mb-4">Page Headers</h4>
                  <div className="border rounded-lg p-4">
                    <PageHeader
                      title="Project Overview"
                      description="Manage your construction project timeline and resources"
                      badge={{ text: "Active", variant: "default" }}
                      meta={[
                        { label: "Progress", value: "75%", icon: <Building size={16} /> },
                        { label: "Tasks", value: "12", icon: <FileText size={16} /> }
                      ]}
                      actions={[
                        {
                          label: "Settings",
                          onClick: () => console.log('Settings'),
                          variant: "outline",
                          icon: <Settings size={16} />
                        }
                      ]}
                      primaryAction={{
                        label: "Add Task",
                        onClick: () => console.log('Add Task'),
                        icon: <Plus size={16} />
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="specialized" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Specialized Components</CardTitle>
                <CardDescription>Domain-specific components for construction management</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold mb-4">Action Buttons</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm">
                      <Eye size={16} className="mr-2" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit size={16} className="mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download size={16} className="mr-2" />
                      Download
                    </Button>
                    <Button variant="destructive" size="sm">
                      <Trash2 size={16} className="mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-4">Construction-Specific Elements</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-orange-200 bg-orange-50">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <Hammer className="text-orange-600" size={20} />
                          <CardTitle className="text-orange-800">Safety Alert</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-orange-700 text-sm">
                          Hard hat required in this area
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-green-200 bg-green-50">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="text-green-600" size={20} />
                          <CardTitle className="text-green-800">Task Complete</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-green-700 text-sm">
                          Foundation work completed successfully
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>Design Principles</CardTitle>
            <CardDescription>Guidelines for using these components effectively</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Color Scheme</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• <span className="font-medium">Primary:</span> Blue (construction reliability)</li>
                  <li>• <span className="font-medium">Secondary:</span> Slate (professional neutrality)</li>
                  <li>• <span className="font-medium">Accent:</span> Orange (safety and attention)</li>
                  <li>• <span className="font-medium">Success:</span> Green (completion, approval)</li>
                  <li>• <span className="font-medium">Danger:</span> Red (errors, urgent issues)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Usage Guidelines</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Use consistent spacing (4px, 8px, 16px, 24px)</li>
                  <li>• Maintain 44px minimum touch target size</li>
                  <li>• Include loading states for async operations</li>
                  <li>• Provide clear feedback for user actions</li>
                  <li>• Use tooltips for icon-only buttons</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComponentShowcase;
