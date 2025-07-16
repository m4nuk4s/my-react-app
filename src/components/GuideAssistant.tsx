import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Send, X, MessageSquareText, Loader2, ExternalLink, Search, Check } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";

// Type definitions
type Guide = {
  id: string;
  title: string;
  model: string;
  category: string;
  difficulty: string;
  time: string;
  description: string;
  steps: {
    title: string;
    description: string;
    imageUrl?: string;
  }[];
  createdBy: string;
};

type Message = {
  role: "user" | "assistant";
  content: string;
};

type TroubleshootingGuide = {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  time: string;
  description: string;
  steps: {
    title: string;
    description: string;
  }[];
};

export default function GuideAssistant() {
  const { settings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your Guide Assistant. Ask me anything about computer troubleshooting, repairs, or disassembly!",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [computerModels, setComputerModels] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<{category: string, items: string[]}[]>([]);
  const [troubleshootingGuides, setTroubleshootingGuides] = useState<TroubleshootingGuide[]>([]);
  const [currentGuide, setCurrentGuide] = useState<Guide | null>(null);
  const [randomSuggestions, setRandomSuggestions] = useState<string[]>([]);
  const [robotAnimation, setRobotAnimation] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();

  // Robot animation
  useEffect(() => {
    const interval = setInterval(() => {
      setRobotAnimation(prev => (prev + 1) % 3);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Load guides from localStorage and setup suggestions
  useEffect(() => {
    const storedGuides = localStorage.getItem("disassemblyGuides");
    if (storedGuides) {
      try {
        const parsedGuides = JSON.parse(storedGuides);
        // Ensure we have valid guides data
        if (Array.isArray(parsedGuides) && parsedGuides.length > 0) {
          setGuides(parsedGuides);
          
          // Create dynamic suggestions based on the disassembly guides
          
          // Create categories based on the available guide categories
          const categories = Array.from(new Set(parsedGuides.map((guide: Guide) => guide.category)));
          const dynamicSuggestions = categories.map(category => {
            return {
              category: `${category} Guides`,
              items: parsedGuides
                .filter((guide: Guide) => guide.category === category)
                .map((guide: Guide) => guide.title)
            };
          });
          
          // Set suggestions from disassembly guides
          setSuggestions(dynamicSuggestions);
          
          // Extract titles from actual guides for random suggestions
          const allTitles = parsedGuides.map((guide: Guide) => guide.title);
          
          // Set random suggestions immediately
          const shuffled = [...allTitles].sort(() => 0.5 - Math.random());
          setRandomSuggestions(shuffled.slice(0, 4));
          
          console.log("Loaded suggestions from disassembly guides:", {
            categories: categories.length,
            guides: parsedGuides.length,
            suggestions: dynamicSuggestions,
            randomSuggestions: shuffled.slice(0, 4)
          });
        }
      } catch (e) {
        console.error("Error parsing disassembly guides:", e);
      }
    } else {
      console.log("No disassembly guides found in localStorage");
      
      // Initialize with sample guides from DisassemblyGuides component
      const initialGuides: Guide[] = [
        {
          id: "1",
          title: "ThinkPad T490 Keyboard Replacement",
          model: "ThinkPad T490",
          category: "Keyboard",
          difficulty: "easy",
          time: "20 minutes",
          description: "Complete guide to replacing the keyboard on a ThinkPad T490 laptop.",
          steps: [{
            title: "Preparation",
            description: "Turn off the laptop, unplug it, and remove the battery if possible."
          }],
          createdBy: "admin"
        },
        {
          id: "2",
          title: "Dell XPS 13 Battery Replacement",
          model: "Dell XPS 13",
          category: "Battery",
          difficulty: "medium",
          time: "30 minutes",
          description: "Step-by-step guide to replacing the battery in a Dell XPS 13 laptop.",
          steps: [{
            title: "Preparation",
            description: "Turn off the laptop and unplug all cables."
          }],
          createdBy: "admin"
        },
        {
          id: "3",
          title: "MacBook Pro 13 Display Assembly Replacement",
          model: "MacBook Pro 13",
          category: "Display",
          difficulty: "hard",
          time: "45 minutes",
          description: "Complete guide for replacing the display assembly on a MacBook Pro 13.",
          steps: [{
            title: "Preparation",
            description: "Turn off the MacBook and unplug all cables."
          }],
          createdBy: "admin"
        }
      ];
      
      // Store guides for future use
      localStorage.setItem('disassemblyGuides', JSON.stringify(initialGuides));
      setGuides(initialGuides);
      
      // Create categories based on the available guide categories
      const categories = Array.from(new Set(initialGuides.map((guide: Guide) => guide.category)));
      const dynamicSuggestions = categories.map(category => {
        return {
          category: `${category} Guides`,
          items: initialGuides
            .filter((guide: Guide) => guide.category === category)
            .map((guide: Guide) => guide.title)
        };
      });
      
      // Set suggestions from disassembly guides
      setSuggestions(dynamicSuggestions);
      
      // Set random suggestions
      const allTitles = initialGuides.map((guide: Guide) => guide.title);
      setRandomSuggestions(allTitles);
      
      console.log("Initialized default guides and suggestions");
    }
    
    // Load computer models
    const storedModels = localStorage.getItem('computerModels');
    if (storedModels) {
      try {
        const models = JSON.parse(storedModels);
        setComputerModels(models);
      } catch (error) {
        console.error("Error parsing computer models:", error);
      }
    }
    
    // We're only using disassembly guides now, so we won't set up separate troubleshooting guides
    setTroubleshootingGuides([]);
  }, []);
  
  // Create a flat array of all suggestion items for autocomplete
  useEffect(() => {
    const allSuggestions = suggestions.flatMap(group => group.items);
    setFilteredSuggestions(allSuggestions);
  }, [suggestions]);
  
  // Filter suggestions based on query
  useEffect(() => {
    if (query) {
      const lowerQuery = query.toLowerCase();
      const allItems = suggestions.flatMap(group => group.items);
      
      const filtered = allItems.filter(item => 
        item.toLowerCase().includes(lowerQuery)
      );
      
      setFilteredSuggestions(filtered);
      setShowAutocomplete(filtered.length > 0);
    } else {
      setShowAutocomplete(false);
    }
  }, [query, suggestions]);
  
  // Detect if user is viewing a specific guide
  useEffect(() => {
    const path = location.pathname;
    // Check if path matches /disassembly/{id} pattern
    const match = path.match(/\/disassembly\/(\w+)/);
    
    if (match && match[1]) {
      const guideId = match[1];
      const guide = guides.find(g => g.id === guideId);
      
      if (guide && guide !== currentGuide) {
        setCurrentGuide(guide);
        // Add a contextual message when the user views a guide
        setMessages(prev => [
          ...prev,
          {
            role: "assistant",
            content: `I see you're viewing the ${guide.title} guide. Need any help with this ${guide.difficulty} procedure?`
          }
        ]);
      }
    } else {
      setCurrentGuide(null);
    }
  }, [location.pathname, guides, currentGuide]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Refresh random suggestions periodically
  useEffect(() => {
    // Update random suggestions every 20 seconds
    const interval = setInterval(() => {
      if (guides.length > 0) {
        // Only use disassemblyGuides for suggestions
        const allTitles = guides.map(guide => guide.title);
        const shuffled = [...allTitles].sort(() => 0.5 - Math.random());
        setRandomSuggestions(shuffled.slice(0, 4));
      }
    }, 20000);
    
    return () => clearInterval(interval);
  }, [guides]);

  const handleSend = () => {
    if (!query.trim()) return;

    // Add user message
    const userMessage: Message = { role: "user", content: query };
    setMessages((prev) => [...prev, userMessage]);
    
    // Clear input
    setQuery("");
    setShowSuggestions(false);
    setShowAutocomplete(false);
    
    // Set loading state
    setIsLoading(true);
    
    // Process the query and generate a response
    setTimeout(() => {
      const response = generateResponse(query, guides, troubleshootingGuides, currentGuide);
      const assistantMessage: Message = { role: "assistant", content: response };
      setMessages((prev) => [...prev, assistantMessage]);
      
      // Update suggestions based on the query result
      const lowerQuery = query.toLowerCase();
      
      // Find guides that match the query
      const matchingGuides = guides.filter(guide => 
        guide.title.toLowerCase().includes(lowerQuery) || 
        guide.description.toLowerCase().includes(lowerQuery) ||
        guide.category.toLowerCase().includes(lowerQuery) ||
        guide.model.toLowerCase().includes(lowerQuery)
      );
      
      // If guides were found, update random suggestions with related guides
      if (matchingGuides.length > 0) {
        const relatedCategory = matchingGuides[0].category;
        const relatedGuides = guides
          .filter(g => g.category === relatedCategory)
          .map(g => g.title);
        
        if (relatedGuides.length > 0) {
          setRandomSuggestions(relatedGuides.slice(0, 4));
        }
      }
      
      setIsLoading(false);
    }, 800); // Simulate processing time
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    setShowAutocomplete(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };
  
  // Robot avatar component
  const RobotAvatar = ({ state }: { state: number }) => {
    const eyes = ["◕◕", "••", "○○"][state];
    return (
      <div className="absolute left-[-80px] bottom-0 hidden md:flex flex-col items-center">
        <div className="w-[60px] h-[70px] bg-blue-600 rounded-t-2xl flex flex-col items-center justify-between p-2">
          <div className="text-white text-lg font-bold">{eyes}</div>
          <div className="w-[40px] h-[6px] bg-blue-300 rounded-full"></div>
        </div>
        <div className="w-[40px] h-[10px] bg-blue-800 rounded-b-lg"></div>
        <div className="w-[30px] h-[20px] bg-blue-700 rounded-b-lg"></div>
      </div>
    );
  };

  // Don't render if assistant is disabled in settings
  if (settings.showGuideAssistant === false) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="h-12 w-12 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700"
        >
          <MessageSquareText className="h-6 w-6" />
        </Button>
      ) : (
        <div className="relative">
          <RobotAvatar state={robotAnimation} />
          <Card className="w-[350px] sm:w-[400px] h-[500px] shadow-xl flex flex-col">
            <CardHeader className="bg-blue-600 text-white py-3 px-4 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Guide Assistant</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-blue-700 rounded-full"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === "assistant" ? "justify-start" : "justify-end"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg p-3 ${
                        message.role === "assistant"
                          ? "bg-muted text-foreground"
                          : "bg-blue-600 text-white"
                      }`}
                      dangerouslySetInnerHTML={{ __html: message.content }}
                    />
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-lg p-3 bg-muted text-foreground flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            <CardContent className="p-3 border-t">
              <div className="flex items-center space-x-2 mb-2">
                <div className="relative flex-1">
                  <Input
                    ref={inputRef}
                    id="inputField"
                    placeholder="Ask about guides..."
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      // Update filtered suggestions based on query
                      if (e.target.value) {
                        const lowerQuery = e.target.value.toLowerCase();
                        const allItems = suggestions.flatMap(group => group.items);
                        
                        const filtered = allItems.filter(item => 
                          item.toLowerCase().includes(lowerQuery)
                        );
                        
                        setFilteredSuggestions(filtered);
                        setShowAutocomplete(filtered.length > 0);
                      } else {
                        setShowAutocomplete(false);
                      }
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onKeyDown={handleKeyDown}
                    className="flex-1"
                  />
                  
                  {/* Empty query suggestions */}
                  {showSuggestions && query === "" && (
                    <div className="absolute z-50 w-full bg-background border rounded-md shadow-md mt-1 p-1">
                      {suggestions.map((group, index) => (
                        <div key={index}>
                          <div className="text-xs font-medium px-2 py-1 text-muted-foreground">{group.category}</div>
                          {group.items.map((item, itemIndex) => (
                            <div 
                              key={`${index}-${itemIndex}`}
                              className="px-2 py-1.5 text-sm cursor-pointer hover:bg-muted rounded-sm"
                              onClick={() => handleSuggestionClick(item)}
                            >
                              {item}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Button id="sendButton" onClick={handleSend} size="icon" disabled={isLoading}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {/* Show random guide titles from available guides */}
                {randomSuggestions.map((suggestion, index) => (
                  <Badge 
                    key={index}
                    variant="outline" 
                    className="cursor-pointer hover:bg-secondary"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion.length > 20 ? suggestion.substring(0, 20) + '...' : suggestion}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Function to generate responses based on the query and available guides
function generateResponse(query: string, guides: Guide[], troubleshootingGuides: TroubleshootingGuide[], currentGuide: Guide | null): string {
  const normalizedQuery = query.toLowerCase();
  
  // Check for greetings or introductions
  if (/^(hi|hello|hey|greetings)/.test(normalizedQuery)) {
    return currentGuide 
      ? `Hello! I see you're looking at the ${currentGuide.model} ${currentGuide.category} guide. How can I help you with this repair?`
      : "Hello! I'm your Guide Assistant. How can I help you with computer troubleshooting, repairs, or disassembly today?";
  }
  
  // Check for thank you messages
  if (/thank you|thanks|thx/.test(normalizedQuery)) {
    return "You're welcome! If you have any more questions about computer troubleshooting or repairs, feel free to ask.";
  }

  // Check if query contains a video or image link
  const videoLinkRegex = /(https?:\/\/[^\s]+\.(mp4|avi|mov|wmv|flv|mkv|youtube\.com\/watch|youtu\.be))/i;
  const imageLinkRegex = /(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|bmp|svg|webp))/i;
  
  const videoMatch = normalizedQuery.match(videoLinkRegex);
  const imageMatch = normalizedQuery.match(imageLinkRegex);
  
  if (videoMatch) {
    const videoUrl = videoMatch[0];
    return `I see you've shared a video link: <a href="${videoUrl}" target="_blank" class="text-blue-600 hover:underline">${videoUrl}</a><br/><br/>
      Is this a video tutorial that you'd like help with? Or would you like me to suggest guides related to what's shown in the video?`;
  }
  
  if (imageMatch) {
    const imageUrl = imageMatch[0];
    return `I see you've shared an image: <a href="${imageUrl}" target="_blank" class="text-blue-600 hover:underline">${imageUrl}</a><br/><br/>
      If this shows a hardware issue or component, I can help identify it or suggest related guides. What specifically would you like to know about this image?`;
  }
  
  // Computer Repair Guides search
  if (normalizedQuery.includes("computer repair") || normalizedQuery.includes("repair guides")) {
    if (guides.length > 0) {
      // Group guides by category for better organization
      const categorizedGuides: Record<string, Guide[]> = {};
      guides.forEach(guide => {
        if (!categorizedGuides[guide.category]) {
          categorizedGuides[guide.category] = [];
        }
        categorizedGuides[guide.category].push(guide);
      });
      
      let response = "<strong>Computer Repair Guides</strong><br/><br/>";
      
      Object.entries(categorizedGuides).forEach(([category, categoryGuides]) => {
        response += `<strong>${category}</strong>:<br/>`;
        response += categoryGuides.map(guide => 
          `• <a href="/disassembly-guides/${guide.id}" class="text-blue-600 hover:underline">${guide.title}</a> (${guide.model})`
        ).join('<br/>');
        response += '<br/><br/>';
      });
      
      return response;
    }
  }
  
  // Check if query is about a specific model
  const modelMentioned = guides.find(guide => normalizedQuery.includes(guide.model.toLowerCase()));
  if (modelMentioned) {
    const relatedGuides = guides.filter(guide => guide.model === modelMentioned.model);
    if (relatedGuides.length > 0) {
      const guidesText = relatedGuides.map(guide => 
        `• <a href="/disassembly-guides/${guide.id}" class="text-blue-600 hover:underline">${guide.title}</a> (${guide.difficulty} - ${guide.time})`
      ).join('<br/>');
      return `I found ${relatedGuides.length} guide(s) for ${modelMentioned.model}:<br/><br/>${guidesText}<br/><br/>Which one would you like to know more about?`;
    }
  }
  
  // Check if query is about a specific repair category
  const categoryMentioned = guides.find(guide => 
    normalizedQuery.includes(guide.category.toLowerCase()) || 
    (guide.category === "Keyboard" && normalizedQuery.includes("key")) ||
    (guide.category === "Display" && (normalizedQuery.includes("screen") || normalizedQuery.includes("monitor"))) ||
    (guide.category === "Battery" && normalizedQuery.includes("power")) ||
    (guide.category === "Storage" && (normalizedQuery.includes("disk") || normalizedQuery.includes("ssd") || normalizedQuery.includes("hard drive"))) ||
    (guide.category === "Memory" && (normalizedQuery.includes("ram") || normalizedQuery.includes("slow")))
  );
  
  if (categoryMentioned) {
    const relatedGuides = guides.filter(guide => guide.category === categoryMentioned.category);
    if (relatedGuides.length > 0) {
      const guidesText = relatedGuides.map(guide => 
        `• <a href="/disassembly/${guide.id}" class="text-blue-600 hover:underline">${guide.title}</a> (${guide.model})`
      ).join('<br/>');
      return `I found ${relatedGuides.length} guides related to ${categoryMentioned.category} repairs:<br/><br/>${guidesText}<br/><br/>Which one would you like to know more about?`;
    }
  }
  
  // Check for step requests
  if (/steps|next step|how to|procedure|walk through|guide me|show me the steps/.test(normalizedQuery)) {
    // Check if there's a specific guide in context from previous messages
    const guideTitleWords = normalizedQuery.split(' ');
    let foundGuide: Guide | null = null;
    
    // First check if user is asking about steps for a specific guide
    for (const guide of guides) {
      const titleLower = guide.title.toLowerCase();
      if (normalizedQuery.includes(titleLower)) {
        foundGuide = guide;
        break;
      }
    }
    
    // If no specific guide mentioned but user is on a guide page, use current guide
    if (!foundGuide && currentGuide) {
      foundGuide = currentGuide;
    }
    
    if (foundGuide) {
      const stepsList = foundGuide.steps.map((step, index) => {
        let stepContent = `${index + 1}. <strong>${step.title}</strong>: ${step.description}`;
        
        // If the step has an image URL, include it
        if (step.imageUrl) {
          stepContent += `<br/><img src="${step.imageUrl}" alt="${step.title}" class="mt-2 max-w-full rounded-md" />`;
        }
        
        return stepContent;
      }).join('<br/><br/>');
      
      return `<strong>Steps for ${foundGuide.title}</strong><br/><br/>
        ${stepsList}<br/><br/>
        <a href="/disassembly/${foundGuide.id}" class="text-blue-600 hover:underline">Open full guide ↗</a>`;
    }
  }

  // Check if query is about a guide title
  const guideTitleMatch = guides.find(guide => normalizedQuery.includes(guide.title.toLowerCase()));
  if (guideTitleMatch) {
    // Create the response HTML without React components
    return '<strong>' + guideTitleMatch.title + '</strong><br/><br/>' +
      '<strong>Model:</strong> ' + guideTitleMatch.model + '<br/>' +
      '<strong>Difficulty:</strong> ' + guideTitleMatch.difficulty + '<br/>' +
      '<strong>Time Required:</strong> ' + guideTitleMatch.time + '<br/><br/>' +
      guideTitleMatch.description + '<br/><br/>' +
      '<div class="flex space-x-2">' +
      '<a href="/disassembly/' + guideTitleMatch.id + '" class="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 no-underline inline-block text-center">' +
      'View Full Guide' +
      '</a>' +
      '<button ' + 
      'onclick="(function() { document.getElementById(\'inputField\').value = \'Show me steps for ' + guideTitleMatch.title.replace(/'/g, "\\'") + '\'; document.getElementById(\'sendButton\').click(); })()"' +
      ' class="px-3 py-1 text-xs bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">' +
      'Show Steps' +
      '</button>' +
      '</div>';
  }
  
  // We're not using troubleshooting guides anymore, so this section is removed
  
  // Fallback response with guide list option
  return `I don't have specific information about that. You can ask about any of our available repair guides or common troubleshooting issues.<br/><br/>
    <button 
      onclick="(function() { document.getElementById('inputField').value = 'Computer Repair Guides'; document.getElementById('sendButton').click(); })()"
      class="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
    >
      Show All Guides
    </button>`;
}