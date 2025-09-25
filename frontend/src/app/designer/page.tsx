"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Palette, Save, Type, Move, RotateCcw } from "lucide-react"

interface SavedDesign {
  id: string
  productName: string
  text: string
  fontSize: number
  color: string
  position: { x: number; y: number }
  createdAt: string
  image_url?: string
}

export default function ProductDesigner() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [text, setText] = useState("Your Text Here")
  const [fontSize, setFontSize] = useState(24)
  const [textColor, setTextColor] = useState("#ffffff")
  const [textPosition, setTextPosition] = useState({ x: 150, y: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [savedDesigns, setSavedDesigns] = useState<SavedDesign[]>([])

  useEffect(() => {
    const fetchDesigns = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/products/customizations");
        if (!response.ok) {
          throw new Error("Failed to fetch designs");
        }
        const data = await response.json();
        const loadedDesigns: SavedDesign[] = data.map((design: any) => ({
          id: design.id.toString(),
          productName: "Custom T-Shirt",
          product_id: "tshirt-001",
          text: design.custom_text,
          fontSize: design.text_style.fontSize,
          color: design.text_style.color,
          position: design.text_position,
          createdAt: design.created_at,
          image_url: design.image_url,
        }));
        setSavedDesigns(loadedDesigns);
      } catch (error) {
        console.error("Error fetching designs:", error);
      }
    };
    fetchDesigns();
  }, []);

  const productImage = "/black-t-shirt-mockup.jpg"

  useEffect(() => {
    drawCanvas()
  }, [text, fontSize, textColor, textPosition])

  const drawCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw product image background
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // Draw text overlay
      ctx.font = `${fontSize}px Arial`
      ctx.fillStyle = textColor
      ctx.textAlign = "center"
      ctx.fillText(text, textPosition.x, textPosition.y)
    }
    img.src = productImage
  }

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Check if click is near text position
    const textWidth = text.length * (fontSize * 0.6)
    if (
      x >= textPosition.x - textWidth / 2 &&
      x <= textPosition.x + textWidth / 2 &&
      y >= textPosition.y - fontSize &&
      y <= textPosition.y
    ) {
      setIsDragging(true)
      setDragOffset({
        x: x - textPosition.x,
        y: y - textPosition.y,
      })
    }
  }

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setTextPosition({
      x: x - dragOffset.x,
      y: y - dragOffset.y,
    })
  }

  const handleCanvasMouseUp = () => {
    setIsDragging(false)
  }

  const resetPosition = () => {
    setTextPosition({ x: 150, y: 100 })
  }

  const saveDesign = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const imageData = canvas.toDataURL("image/png"); // Get base64 image data

    const designData = {
      product_id: "tshirt-001",
      custom_text: text,
      text_position: textPosition,
      text_style: {
        fontSize,
        color: textColor,
        fontFamily: "Arial",
      },
      image_data: imageData, // Include image data
    };

    try {
      const response = await fetch("http://localhost:8000/api/products/customizations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(designData),
      });

      if (!response.ok) {
        throw new Error("Failed to save design");
      }

      const savedDesign = await response.json();

      const newDesign: SavedDesign = {
        id: savedDesign.id.toString(),
        productName: "Custom T-Shirt",
        product_id: "tshirt-001",
        text: savedDesign.custom_text,
        fontSize: savedDesign.text_style.fontSize,
        color: savedDesign.text_style.color,
        position: savedDesign.text_position,
        createdAt: savedDesign.created_at,
        image_url: savedDesign.image_url, // Store the image URL
      };

      setSavedDesigns((prev) => [newDesign, ...prev]);
    } catch (error) {
      console.error("Error saving design:", error);
    }
  };

  const loadDesign = (design: SavedDesign) => {
    setText(design.text)
    setFontSize(design.fontSize)
    setTextColor(design.color)
    setTextPosition(design.position)
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Product Customization Studio</h1>
        <p className="text-muted-foreground">Design custom text overlays on products</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Design Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="h-5 w-5" />
              <span>Design Controls</span>
            </CardTitle>
            <CardDescription>Customize your text overlay</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="text">Text Content</Label>
              <Input id="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter your text" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fontSize">Font Size</Label>
              <Select value={fontSize.toString()} onValueChange={(value) => setFontSize(Number(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="16">Small (16px)</SelectItem>
                  <SelectItem value="24">Medium (24px)</SelectItem>
                  <SelectItem value="32">Large (32px)</SelectItem>
                  <SelectItem value="40">Extra Large (40px)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Text Color</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="color"
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-16 h-10 p-1 border border-border rounded"
                />
                <span className="text-sm text-muted-foreground">{textColor}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Position</Label>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  X: {Math.round(textPosition.x)}, Y: {Math.round(textPosition.y)}
                </p>
                <p className="text-xs">Drag text on canvas to reposition</p>
              </div>
              <Button variant="outline" size="sm" onClick={resetPosition} className="w-full bg-transparent">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Position
              </Button>
            </div>

            <Button onClick={saveDesign} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Save Design
            </Button>
          </CardContent>
        </Card>

        {/* Canvas Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Type className="h-5 w-5" />
              <span>Live Preview</span>
            </CardTitle>
            <CardDescription>Click and drag text to reposition</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <canvas
                ref={canvasRef}
                width={300}
                height={300}
                className="border border-border rounded-lg cursor-move bg-muted"
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
              />
            </div>
            <div className="mt-4 text-center">
              <Badge variant="outline" className="text-xs">
                <Move className="h-3 w-3 mr-1" />
                Drag text to move
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Saved Designs */}
        <Card>
          <CardHeader>
            <CardTitle>My Designs</CardTitle>
            <CardDescription>Your saved customizations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {savedDesigns.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No designs saved yet</p>
              ) : (
                savedDesigns.map((design) => (
                  <div key={design.id} className="border border-border rounded-lg p-4 space-y-3">
                    {design.image_url && (
                      <img src={`http://localhost:8000${design.image_url}`} alt="Custom Design" className="w-full h-32 object-contain mb-2 rounded-md bg-gray-100" />
                    )}
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium text-foreground">{design.productName}</h4>
                        <p className="text-sm text-muted-foreground">"{design.text}"</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => loadDesign(design)}>
                        Load
                      </Button>
                    </div>

                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>Size: {design.fontSize}px</span>
                      <div className="flex items-center space-x-1">
                        <div
                          className="w-3 h-3 rounded border border-border"
                          style={{ backgroundColor: design.color }}
                        />
                        <span>{design.color}</span>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {new Date(design.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
