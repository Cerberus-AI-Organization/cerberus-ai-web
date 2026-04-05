import {useEffect, useState} from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Progress} from "@/components/ui/progress";
import {toast} from "sonner";
import {useAuth} from "@/states/AuthContext";
import {Card} from "@/components/ui/card.tsx";
import {LucideRefreshCw, CassetteTapeIcon, Pencil, Trash2} from "lucide-react";
import type {ComputeNodeDetail, ComputeNodeModel} from "@/types/computeNode.ts";
import {API_URL} from "@/lib/api.ts";
import {Tooltip, TooltipTrigger, TooltipContent} from "@/components/ui/tooltip.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

type FormData = {
  hostname: string;
  api_type: string;
  url: string;
  api_key: string;
  max_ctx: string;
  max_layers_on_gpu: string;
  priority: string;
};

function getDefaultFormData(): FormData {
  return {
    hostname: "",
    api_type: "ollama",
    url: "http://localhost:11434",
    api_key: "",
    max_ctx: "16384",
    max_layers_on_gpu: "-1",
    priority: "1",
  };
}

function parseAndValidateFormData(formData: FormData) {
  const priority = parseInt(formData.priority, 10);
  const maxCtx = parseInt(formData.max_ctx, 10);
  const maxLayers = parseInt(formData.max_layers_on_gpu, 10);

  if (formData.url.trim() === "" || (
    !formData.url.startsWith("http://") &&
    !formData.url.startsWith("https://")
  )) {
    toast.error("URL must be a valid URL.");
    return null;
  }

  if (formData.api_type !== "ollama" && formData.api_type !== "openai") {
    toast.error("API type must be either 'ollama' or 'openai'.");
    return null;
  }

  if ([priority, maxCtx, maxLayers].some(Number.isNaN)) {
    toast.error("Priority, Max CTX and Max Layers on GPU must be numbers.");
    return null;
  }

  return {
    hostname: formData.hostname,
    url: formData.url,
    api_type: formData.api_type,
    api_key: formData.api_key,
    priority,
    max_ctx: maxCtx,
    max_layers_on_gpu: maxLayers,
  };
}

function NodeFormFields({formData, setFormData}: {
  formData: FormData;
  setFormData: (data: FormData) => void;
}) {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="api-type">API Type</Label>
        <Select value={formData.api_type} onValueChange={value => setFormData({...formData, api_type: value})}>
          <SelectTrigger id="api-type" className="w-full">
            <SelectValue placeholder="Select API Type"/>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ollama">Ollama</SelectItem>
            <SelectItem value="openai">OpenAI</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="hostname">Hostname</Label>
        <Input
          id="hostname"
          value={formData.hostname}
          onChange={(e) => setFormData({...formData, hostname: e.target.value})}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="url">Url</Label>
        <Input
          id="url"
          value={formData.url}
          onChange={(e) => setFormData({...formData, url: e.target.value})}
        />
      </div>
      {formData.api_type === "openai" &&
        <div className="grid gap-2">
          <Label htmlFor="api_key">API Key</Label>
          <Input
            id="api_key"
            value={formData.api_key}
            onChange={(e) => setFormData({...formData, api_key: e.target.value})}
          />
        </div>
      }
      <div className="grid gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Label htmlFor="priority">Priority</Label>
          </TooltipTrigger>
          <TooltipContent>
            <p>Higher number will sort node higher and biggest will be used for knowledge creation.</p>
          </TooltipContent>
        </Tooltip>
        <Input
          id="priority"
          value={formData.priority}
          onChange={(e) => setFormData({...formData, priority: e.target.value})}
        />
      </div>
      {formData.api_type === "ollama" && <>
        <div className="grid gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Label htmlFor="max-ctx">Max CTX</Label>
            </TooltipTrigger>
            <TooltipContent>
              <p>Size of Context Window for models in tokens.</p>
              <p>Higher number will cost more graphics memory and slowdown generation if used.</p>
            </TooltipContent>
          </Tooltip>
          <Input
            id="max-ctx"
            value={formData.max_ctx}
            onChange={(e) => setFormData({...formData, max_ctx: e.target.value})}
          />
        </div>
        <div className="grid gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Label htmlFor="max-layers-on-gpu">Max Layers on Gpu</Label>
            </TooltipTrigger>
            <TooltipContent>
              <p>The maximum number of layers that can be processed on the GPU.</p>
              <p>Set to -1 to Automatic detection of the maximum number layers.</p>
              <p>Use to sideload to CPU to lower the graphics memory usage.</p>
            </TooltipContent>
          </Tooltip>
          <Input
            id="max-layers-on-gpu"
            value={formData.max_layers_on_gpu}
            onChange={(e) => setFormData({...formData, max_layers_on_gpu: e.target.value})}
          />
        </div>
      </>
      }
    </div>
  );
}

function AdminDashboardComputeNodes() {
  const {isAuthenticated, token} = useAuth();
  const [nodes, setNodes] = useState<ComputeNodeDetail[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isModelsOpen, setIsModelsOpen] = useState(false);
  const [isPullOpen, setPullOpen] = useState(false);
  const [models, setModels] = useState<ComputeNodeModel[]>([]);
  const [modelName, setModelName] = useState("");
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState("");
  const [isPulling, setIsPulling] = useState(false);
  const [downloadStats, setDownloadStats] = useState({
    downloaded: 0,
    total: 0,
    startTime: 0
  });
  const [selectedNode, setSelectedNode] = useState<ComputeNodeDetail | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    column: keyof ComputeNodeDetail;
    direction: 'asc' | 'desc'
  } | null>(null);
  const [filterText, setFilterText] = useState("");
  const [formData, setFormData] = useState<FormData>(getDefaultFormData());

  async function fetchNodes() {
    try {
      const response = await fetch(`${API_URL}/compute-nodes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setNodes(data);
      } else {
        toast.error("Failed to fetch nodes");
      }
    } catch {
      toast.error("Error fetching nodes");
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchNodes().then();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isPullOpen) {
      setIsPulling(false);
      setModelName("");
      setDownloadProgress(0);
      setDownloadStatus("");
      setDownloadStats({downloaded: 0, total: 0, startTime: 0});
    }
  }, [isPullOpen]);

  const handleCreate = async () => {
    const payload = parseAndValidateFormData(formData);
    if (!payload) return;
    try {
      const response = await fetch(`${API_URL}/compute-nodes`, {
        method: "POST",
        headers: {"Content-Type": "application/json", Authorization: `Bearer ${token}`},
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        toast.success("Node created successfully");
        setIsCreateOpen(false);
        await fetchNodes();
      } else {
        toast.error("Failed to create node");
      }
    } catch (error) {
      console.error("Error creating node:", error);
      toast.error("Error creating node");
    }
  };

  const handleEdit = async () => {
    if (!selectedNode) return;
    const payload = parseAndValidateFormData(formData);
    if (!payload) return;
    try {
      const response = await fetch(`${API_URL}/compute-nodes/${selectedNode.id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json", Authorization: `Bearer ${token}`},
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        toast.success("Node updated successfully");
        setIsEditOpen(false);
        await fetchNodes();
      } else {
        toast.error("Failed to update node");
      }
    } catch (error) {
      console.error("Error updating node:", error);
      toast.error("Error updating node");
    }
  };

  const handleDelete = async () => {
    if (!selectedNode) return;
    try {
      const response = await fetch(`${API_URL}/compute-nodes/${selectedNode.id}`, {
        method: "DELETE",
        headers: {Authorization: `Bearer ${token}`},
      });
      if (response.ok) {
        toast.success("Node deleted successfully");
        setIsDeleteOpen(false);
        await fetchNodes();
      } else {
        toast.error("Failed to delete node");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Error deleting node");
    }
  };

  return (
    <>
      <div className="flex justify-end mb-4 gap-2">
        <Button onClick={() => {
          if (isAuthenticated) {
            fetchNodes().then(() => {
              toast.success("Compute Nodes refreshed");
            });
          }
        }}>
          <LucideRefreshCw className="size-4"/>
        </Button>

        <Dialog open={isCreateOpen} onOpenChange={open => {
          setFormData(getDefaultFormData());
          setIsCreateOpen(open);
        }}>
          <DialogTrigger asChild>
            <Button>Add Node</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Node</DialogTitle>
            </DialogHeader>
            <NodeFormFields formData={formData} setFormData={setFormData}/>
            <Button onClick={handleCreate}>Create</Button>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-4">
        <div className="flex gap-4 mb-4">
          <Input
            type="text"
            placeholder="Search nodes..."
            className="border p-2 rounded w-full"
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => {
                setSortConfig(sortConfig?.column === 'hostname' && sortConfig.direction === 'asc'
                  ? {column: 'hostname', direction: 'desc'}
                  : {column: 'hostname', direction: 'asc'});
              }} className="cursor-pointer">
                Hostname {sortConfig?.column === 'hostname' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead>IP</TableHead>
              <TableHead>API Type</TableHead>
              <TableHead onClick={() => {
                setSortConfig(sortConfig?.column === 'status' && sortConfig.direction === 'asc'
                  ? {column: 'status', direction: 'desc'}
                  : {column: 'status', direction: 'asc'});
              }} className="cursor-pointer">
                Status {sortConfig?.column === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead onClick={() => {
                setSortConfig(sortConfig?.column === 'created_at' && sortConfig.direction === 'asc'
                  ? {column: 'created_at', direction: 'desc'}
                  : {column: 'created_at', direction: 'asc'});
              }} className="cursor-pointer">
                Created At {sortConfig?.column === 'created_at' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead onClick={() => {
                setSortConfig(sortConfig?.column === 'priority' && sortConfig.direction === 'asc'
                  ? {column: 'priority', direction: 'desc'}
                  : {column: 'priority', direction: 'asc'});
              }}>Priority</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {nodes
              .filter(node =>
                filterText === "" ||
                Object.values(node).some(value =>
                  value!.toString().toLowerCase().includes(filterText.toLowerCase())
                )
              )
              .sort((a, b) => {
                if (!sortConfig) return 0;
                const {column, direction} = sortConfig;
                if (a[column]! < b[column]!) return direction === 'asc' ? -1 : 1;
                if (a[column]! > b[column]!) return direction === 'asc' ? 1 : -1;
                return 0;
              })
              .map((node) => (
                <TableRow key={node.id}>
                  <TableCell>{node.hostname}</TableCell>
                  <TableCell>{node.url}</TableCell>
                  <TableCell>{node.api_type}</TableCell>
                  <TableCell>{node.status}</TableCell>
                  <TableCell>{new Date(node.created_at).toLocaleString(navigator.language, {
                    year: "numeric",
                    month: "long",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                  })}</TableCell>
                  <TableCell>{node.priority}</TableCell>
                  <TableCell className="text-right">
                    <button
                      className="hover:text-foreground/70 mx-2"
                      onClick={async () => {
                        if (node.status === "offline") {
                          toast.error("Compute Node is Offline");
                          return;
                        }
                        setSelectedNode(node);
                        try {
                          const response = await fetch(`${API_URL}/compute-nodes/${node.id}/models`, {
                            headers: {Authorization: `Bearer ${token}`},
                          });
                          if (response.ok) {
                            const data = await response.json();
                            setModels(data);
                            setIsModelsOpen(true);
                          }
                        } catch {
                          toast.error("Failed to fetch models");
                        }
                      }}
                    >
                      <CassetteTapeIcon className="size-4 inline"/>
                    </button>
                    <button
                      className="text-blue-500 hover:text-blue-700 mx-2"
                      onClick={() => {
                        setSelectedNode(node);
                        setFormData({
                          hostname: node.hostname,
                          url: node.url,
                          api_type: node.api_type,
                          api_key: node.api_key ?? "",
                          priority: node.priority.toString(),
                          max_ctx: node.max_ctx.toString(),
                          max_layers_on_gpu: node.max_layers_on_gpu.toString()
                        });
                        setIsEditOpen(true);
                      }}
                    >
                      <Pencil className="w-4 h-4 inline"/>
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700 mx-2"
                      onClick={() => {
                        setSelectedNode(node);
                        setIsDeleteOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4 inline"/>
                    </button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Node</DialogTitle>
          </DialogHeader>
          <NodeFormFields formData={formData} setFormData={setFormData}/>
          <Button onClick={handleEdit}>Save Changes</Button>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              compute node.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isModelsOpen} onOpenChange={setIsModelsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Models on {selectedNode?.hostname}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            {models.map((model, index) => (
              <div key={index} className="flex justify-between items-center">
                <span>{model.name}</span>
                <div className="flex items-center gap-4">
                  <span>{(model.size / 1024 / 1024).toFixed(2)} MB</span>
                  {selectedNode?.api_type === "ollama" &&
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon">
                          <Trash2 className="size-4"/>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete model?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the model {model.name}.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={async () => {
                            try {
                              const response = await fetch(
                                `${API_URL}/compute-nodes/${selectedNode?.id}/models/${model.name}`,
                                {
                                  method: "DELETE",
                                  headers: {Authorization: `Bearer ${token}`},
                                }
                              );
                              if (response.ok) {
                                toast.success("Model deleted successfully");
                                setModels(models.filter(m => m.name !== model.name));
                              } else {
                                toast.error("Failed to delete model");
                              }
                            } catch {
                              toast.error("Error deleting model");
                            }
                          }}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  }
                </div>
              </div>
            ))}
          </div>
          {selectedNode?.api_type === "ollama" &&
            <Button onClick={() => {
              setPullOpen(true);
              setIsModelsOpen(false);
            }}>
              Pull New Model
            </Button>
          }
        </DialogContent>
      </Dialog>

      <Dialog open={isPullOpen} onOpenChange={setPullOpen}>
        <DialogContent showCloseButton={!isPulling} onInteractOutside={(e) => {
          if (isPulling) {
            e.preventDefault();
          }
        }}>
          <DialogHeader>
            <DialogTitle>Pull Model</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <Input
              placeholder="Model name (e.g. qwen3:8b)"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              disabled={isPulling}
            />
            <div className="space-y-4">
              <div className="text-sm">{downloadStatus}</div>
              <Progress value={downloadProgress} className="w-full"/>
              {isPulling && downloadStats.total > 0 && (
                <div className="text-sm space-y-1">
                  <div>Downloaded: {(downloadStats.downloaded / 1024 / 1024).toFixed(2)} MB
                    of {(downloadStats.total / 1024 / 1024).toFixed(2)} MB
                  </div>
                  <div>
                    Remaining time:{' '}
                    {(() => {
                      const {startTime, downloaded, total} = downloadStats;
                      const elapsedMs = Date.now() - startTime;
                      if (elapsedMs <= 0 || downloaded <= 0 || total <= 0 || downloaded >= total) {
                        return 'Calculating...';
                      }
                      const bytesPerSec = downloaded / (elapsedMs / 1000);
                      if (bytesPerSec < 1) return 'Calculating...';
                      const remainingSeconds = Math.ceil((total - downloaded) / bytesPerSec);
                      const hours = Math.floor(remainingSeconds / 3600);
                      const minutes = Math.floor((remainingSeconds % 3600) / 60);
                      const seconds = remainingSeconds % 60;
                      if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
                      if (minutes > 0) return `${minutes}m ${seconds}s`;
                      return `${seconds}s`;
                    })()}
                  </div>
                </div>
              )}
            </div>
            <Button
              disabled={!selectedNode || !modelName || isPulling}
              onClick={async () => {
                setIsPulling(true);
                if (!selectedNode) return;
                try {
                  const response = await fetch(
                    `${API_URL}/compute-nodes/${selectedNode.id}/models/pull`,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({name: modelName}),
                    }
                  );

                  if (!response.ok) throw new Error("Failed to start pull");

                  const reader = response.body?.getReader();
                  if (!reader) throw new Error("No reader available");

                  setDownloadStatus("Starting pull...");
                  setDownloadStats({downloaded: 0, total: 0, startTime: Date.now()});

                  while (true) {
                    const {done, value} = await reader.read();
                    if (done) break;

                    const text = new TextDecoder().decode(value);
                    const lines = text.split('\n').filter(line => line.trim());

                    for (const line of lines) {
                      try {
                        const data = JSON.parse(line);

                        if (data.error) {
                          toast.error("Failed to pull model: " + data.error.split(': ')[1]);
                          setIsPulling(false);
                          return;
                        }

                        setDownloadStatus(data.status);
                        if (data.total && data.completed) {
                          setDownloadProgress((data.completed / data.total) * 100);
                          setDownloadStats(prev => ({...prev, downloaded: data.completed, total: data.total}));
                        } else {
                          setDownloadStats(prev => ({...prev, downloaded: 0, total: 0}));
                        }
                      } catch {
                        console.error('Failed to parse line:', line);
                      }
                    }
                  }

                  toast.success("Model pulled successfully");
                  setIsPulling(false);
                } catch {
                  toast.error("Failed to pull model");
                }
              }}>
              Pull
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AdminDashboardComputeNodes;
