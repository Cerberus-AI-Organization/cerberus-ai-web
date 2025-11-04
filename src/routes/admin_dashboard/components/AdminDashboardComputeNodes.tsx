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

interface Model {
  name: string;
  size: number;
}

interface ComputeNode {
  id: number;
  hostname: string;
  ip: string;
  port: number;
  added_by: number;
  status: string;
  created_at: string;
}

function AdminDashboardComputeNodes() {
  const {isAuthenticated, token} = useAuth();
  const [nodes, setNodes] = useState<ComputeNode[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isModelsOpen, setIsModelsOpen] = useState(false);
  const [isPullOpen, setPullOpen] = useState(false);
  const [models, setModels] = useState<Model[]>([]);
  const [modelName, setModelName] = useState("");
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState("");
  const [isPulling, setIsPulling] = useState(false);
  const [downloadStats, setDownloadStats] = useState({
    downloaded: 0,
    total: 0,
    startTime: 0
  });
  const [selectedNode, setSelectedNode] = useState<ComputeNode | null>(null);
  const [sortConfig, setSortConfig] = useState<{ column: keyof ComputeNode; direction: 'asc' | 'desc' } | null>(null);
  const [filterText, setFilterText] = useState("");
  const [formData, setFormData] = useState({
    hostname: "",
    ip: "",
    port: "11434",
  });

  async function fetchNodes() {
    try {
      const response = await fetch("/api/compute-nodes", {
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
  };

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
      setDownloadStats({
        downloaded: 0,
        total: 0,
        startTime: 0
      });
    }
  }, [isPullOpen]);

  const handleCreate = async () => {
    try {
      const response = await fetch("/api/compute-nodes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        toast.success("Node created successfully");
        setIsCreateOpen(false);
        await fetchNodes();
      } else {
        toast.error("Failed to create node");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Error creating node");
    }
  };

  const handleEdit = async () => {
    if (!selectedNode) return;
    try {
      const response = await fetch(
        `/api/compute-nodes/${selectedNode.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );
      if (response.ok) {
        toast.success("Node updated successfully");
        setIsEditOpen(false);
        await fetchNodes();
      } else {
        toast.error("Failed to update node");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Error updating node");
    }
  };

  const handleDelete = async () => {
    if (!selectedNode) return;
    try {
      const response = await fetch(
        `/api/compute-nodes/${selectedNode.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
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

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>Add Node</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Node</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="hostname">Hostname</Label>
                <Input
                  id="hostname"
                  value={formData.hostname}
                  onChange={(e) =>
                    setFormData({...formData, hostname: e.target.value})
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ip">IP Address</Label>
                <Input
                  id="ip"
                  value={formData.ip}
                  onChange={(e) =>
                    setFormData({...formData, ip: e.target.value})
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="port">Port</Label>
                <Input
                  id="port"
                  value={formData.port}
                  onChange={(e) =>
                    setFormData({...formData, port: e.target.value})
                  }
                />
              </div>
            </div>
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
              <TableHead>Port</TableHead>
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
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {nodes
              .filter(node =>
                filterText === "" ||
                Object.values(node).some(value =>
                  value.toString().toLowerCase().includes(filterText.toLowerCase())
                )
              )
              .sort((a, b) => {
                if (!sortConfig) return 0;
                const {column, direction} = sortConfig;
                if (a[column] < b[column]) return direction === 'asc' ? -1 : 1;
                if (a[column] > b[column]) return direction === 'asc' ? 1 : -1;
                return 0;
              })
              .map((node) => (
                <TableRow key={node.id}>
                  <TableCell>{node.hostname}</TableCell>
                  <TableCell>{node.ip}</TableCell>
                  <TableCell>{node.port}</TableCell>
                  <TableCell>{node.status}</TableCell>
                  <TableCell>{new Date(node.created_at).toUTCString()}</TableCell>
                  <TableCell className="text-right">
                    <button
                      className="hover:text-foreground/70 mx-2"
                      onClick={async () => {
                        if (node.status === "offline") {
                          toast.error("Compute Node is Offline");
                          return
                        }
                        setSelectedNode(node);
                        try {
                          const response = await fetch(`/api/compute-nodes/${node.id}/models`, {
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
                          ip: node.ip,
                          port: node.port.toString(),
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
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-hostname">Hostname</Label>
              <Input
                id="edit-hostname"
                value={formData.hostname}
                onChange={(e) =>
                  setFormData({...formData, hostname: e.target.value})
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-ip">IP Address</Label>
              <Input
                id="edit-ip"
                value={formData.ip}
                onChange={(e) => setFormData({...formData, ip: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-port">Port</Label>
              <Input
                id="edit-port"
                value={formData.port}
                onChange={(e) =>
                  setFormData({...formData, port: e.target.value})
                }
              />
            </div>
          </div>
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
                              `/api/compute-nodes/${selectedNode?.id}/models/${model.name}`,
                              {
                                method: "DELETE",
                                headers: {
                                  Authorization: `Bearer ${token}`,
                                },
                              }
                            );
                            if (response.ok) {
                              toast.success("Model deleted successfully");
                              const updatedModels = models.filter(m => m.name !== model.name);
                              setModels(updatedModels);
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
                </div>
              </div>

            ))}
          </div>
          <Button onClick={() => {
            setPullOpen(true);
            setIsModelsOpen(false);
          }}>Pull New Model</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={isPullOpen} onOpenChange={setPullOpen}>
        <DialogContent onInteractOutside={(e) => {
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
                  <div>Remaining time: {(() => {
                    const elapsedMs = Date.now() - downloadStats.startTime;
                    const bytesPerMs = downloadStats.downloaded / elapsedMs;
                    const remainingMs = (downloadStats.total - downloadStats.downloaded) / bytesPerMs;
                    return `${Math.ceil(remainingMs / 1000)} seconds`;
                  })()}</div>
                </div>
              )}
            </div>
            <Button
              disabled={!selectedNode || !modelName || isPulling}
              onClick={async () => {
                setIsPulling(true);
                setDownloadStats({
                  downloaded: 0,
                  total: 0,
                  startTime: Date.now()
                });
                if (!selectedNode) return;
                try {
                  const response = await fetch(
                    `/api/compute-nodes/${selectedNode.id}/models/pull`,
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
                          setDownloadStats(prev => ({
                            ...prev,
                            downloaded: data.completed,
                            total: data.total
                          }));
                        } else {
                          setDownloadStats({
                            downloaded: 0,
                            total: 0,
                            startTime: 0
                          });
                        }
                      } catch {
                        console.error('Failed to parse line:', line);
                      }
                    }
                  }

                  toast.success("Model pulled successfully");
                  setIsPulling(false);
                  setPullOpen(false);
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