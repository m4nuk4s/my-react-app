import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function ComputerModelManagement() {
  const [computerModels, setComputerModels] = useState<string[]>([]);
  const [newModelName, setNewModelName] = useState("");

  // Load computer models from localStorage on component mount
  useEffect(() => {
    const storedModels = localStorage.getItem('computerModels');
    if (storedModels) {
      try {
        setComputerModels(JSON.parse(storedModels));
      } catch (error) {
        console.error("Error parsing computer models:", error);
        setComputerModels([
          "ThinkPad T490",
          "ThinkPad X1 Carbon",
          "HP EliteBook 840",
          "Dell XPS 13",
          "MacBook Pro 13",
          "Asus ZenBook",
          "Surface Pro 7",
        ]);
      }
    } else {
      // Initialize with default models if none exist
      const defaultModels = [
        "ThinkPad T490",
        "ThinkPad X1 Carbon",
        "HP EliteBook 840",
        "Dell XPS 13",
        "MacBook Pro 13",
        "Asus ZenBook",
        "Surface Pro 7",
      ];
      setComputerModels(defaultModels);
      localStorage.setItem('computerModels', JSON.stringify(defaultModels));
    }
  }, []);

  // Function to add a new computer model
  const handleAddModel = () => {
    if (!newModelName.trim()) {
      toast.error("Model name cannot be empty");
      return;
    }

    if (computerModels.includes(newModelName.trim())) {
      toast.error("This model already exists");
      return;
    }

    const updatedModels = [...computerModels, newModelName.trim()];
    setComputerModels(updatedModels);
    localStorage.setItem('computerModels', JSON.stringify(updatedModels));
    setNewModelName("");
    toast.success("Computer model added successfully");
  };

  // Function to delete a computer model
  const handleDeleteModel = (modelToDelete: string) => {
    const updatedModels = computerModels.filter(model => model !== modelToDelete);
    setComputerModels(updatedModels);
    localStorage.setItem('computerModels', JSON.stringify(updatedModels));
    toast.success("Computer model removed successfully");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Computer Model Management</CardTitle>
        <CardDescription>Add or remove computer models for disassembly guides</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Enter new computer model name"
                value={newModelName}
                onChange={(e) => setNewModelName(e.target.value)}
              />
            </div>
            <Button onClick={handleAddModel}>
              <Plus className="h-4 w-4 mr-1" />
              Add Model
            </Button>
          </div>
          
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model Name</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {computerModels.map((model, index) => (
                  <TableRow key={index}>
                    <TableCell>{model}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteModel(model)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {computerModels.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-6 text-muted-foreground">
                      No computer models available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}