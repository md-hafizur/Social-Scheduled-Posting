"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, ImageIcon, Send } from "lucide-react"

interface ScheduledPost {
  id: string
  content: string
  platforms: string[]
  scheduledTime: string
  status: "scheduled" | "published" | "failed"
  imageUrl?: string
}

export default function SocialScheduler() {
  const [posts, setPosts] = useState<ScheduledPost[]>([])

  const parsePlatforms = (platforms: any): string[] => {
    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return [];
    }
    // Check for the weird string format e.g. ["'["facebook","twitter"]'"]
    if (typeof platforms[0] === 'string' && platforms[0].includes('[') && platforms[0].includes(']')) {
      return platforms[0].replace(/[\[\]'"]/g, '').split(',').map((p: string) => p.trim());
    }
    // Handle clean array e.g. ["facebook", "twitter"]
    return platforms;
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/posts/?skip=0&limit=100');
        if (response.ok) {
          const data = await response.json();
          const formattedPosts: ScheduledPost[] = data.map((post: any) => ({
            id: post.id.toString(),
            content: post.content,
            platforms: parsePlatforms(post.platforms),
            scheduledTime: post.scheduled_time,
            status: post.status,
            imageUrl: post.image_url ? `http://127.0.0.1:8000${post.image_url}` : undefined,
          }));
          setPosts(formattedPosts);
        } else {
          console.error("Failed to fetch posts");
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, []);

  const [newPost, setNewPost] = useState({
    content: "",
    platforms: [] as string[],
    scheduledTime: "",
    imageFile: null as File | null,
  })

  const platforms = ["Twitter", "LinkedIn", "Instagram", "Facebook"]

  const handlePlatformChange = (platform: string, checked: boolean) => {
    if (checked) {
      setNewPost((prev) => ({
        ...prev,
        platforms: [...prev.platforms, platform],
      }))
    } else {
      setNewPost((prev) => ({
        ...prev,
        platforms: prev.platforms.filter((p) => p !== platform),
      }))
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewPost((prev) => ({ ...prev, imageFile: file }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPost.content || !newPost.scheduledTime || newPost.platforms.length === 0) {
      alert("Please fill all required fields.")
      return
    }

    const formData = new FormData()
    formData.append("content", newPost.content)
    formData.append("platforms", newPost.platforms.join(","))
    formData.append("scheduled_time", newPost.scheduledTime)
    if (newPost.imageFile) {
      formData.append("image", newPost.imageFile)
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/posts/", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const newPostData = await response.json()
        const post: ScheduledPost = {
          id: newPostData.id,
          content: newPostData.content,
          platforms: parsePlatforms(newPostData.platforms),
          scheduledTime: newPostData.scheduled_time,
          status: "scheduled",
          imageUrl: newPostData.image_url ? `http://127.0.0.1:8000${newPostData.image_url}` : undefined,
        }
        setPosts((prev) => [post, ...prev])
        setNewPost({
          content: "",
          platforms: [],
          scheduledTime: "",
          imageFile: null,
        })
      } else {
        const errorData = await response.json()
        alert(`Failed to schedule post: ${JSON.stringify(errorData)}`)
      }
    } catch (error) {
      console.error("Error submitting post:", error)
      alert("An error occurred while scheduling the post.")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-500/20 text-blue-400"
      case "published":
        return "bg-green-500/20 text-green-400"
      case "failed":
        return "bg-red-500/20 text-red-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">AI Social Media Scheduler</h1>
        <p className="text-muted-foreground">Schedule posts across multiple platforms with AI assistance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create New Post */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Send className="h-5 w-5" />
              <span>Create New Post</span>
            </CardTitle>
            <CardDescription>Schedule your content across multiple social platforms</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="content">Post Content <span className="text-red-500">*</span></Label>
                <Textarea
                  id="content"
                  placeholder="What's on your mind?"
                  value={newPost.content}
                  onChange={(e) => setNewPost((prev) => ({ ...prev, content: e.target.value }))}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-3">
                <Label>Target Platforms <span className="text-red-500">*</span></Label>
                <div className="grid grid-cols-2 gap-3">
                  {platforms.map((platform) => (
                    <div key={platform} className="flex items-center space-x-2">
                      <Checkbox
                        id={platform}
                        checked={newPost.platforms.includes(platform)}
                        onCheckedChange={(checked) => handlePlatformChange(platform, checked as boolean)}
                      />
                      <Label htmlFor={platform} className="text-sm font-normal">
                        {platform}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduledTime">Schedule Time <span className="text-red-500">*</span></Label>
                <Input
                  id="scheduledTime"
                  type="datetime-local"
                  value={newPost.scheduledTime}
                  onChange={(e) => setNewPost((prev) => ({ ...prev, scheduledTime: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Upload Image (Optional)</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                </div>
                {newPost.imageFile && (
                  <p className="text-sm text-muted-foreground">Selected: {newPost.imageFile.name}</p>
                )}
              </div>

              <Button type="submit" className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Post
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Scheduled Posts List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Scheduled Posts</span>
            </CardTitle>
            <CardDescription>Manage your upcoming and published posts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {posts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No posts scheduled yet</p>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <p className="text-sm text-foreground flex-1">{post.content}</p>
                      <Badge className={getStatusColor(post.status)}>{post.status}</Badge>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {post.platforms.map((platform) => (
                        <Badge key={platform} variant="outline" className="text-xs">
                          {platform}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(post.scheduledTime).toLocaleString()}
                    </div>

                    {post.imageUrl && (
                      <div className="mt-2">
                        <img
                          src={post.imageUrl || "/placeholder.svg"}
                          alt="Post attachment"
                          className="w-16 h-16 object-cover rounded border border-border"
                        />
                      </div>
                    )}
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
