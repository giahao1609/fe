export type ObjectId = string;


export interface BlogCategory {
_id: ObjectId;
name: string;
slug: string;
createdAt?: string;
}


export interface BlogTag {
_id: ObjectId;
name: string;
slug: string;
createdAt?: string;
}


export type CommentStatus = "pending" | "approved" | "rejected";


export interface BlogComment {
_id: ObjectId;
postId: ObjectId;
userName: string;
userEmail?: string;
content: string;
rating?: number; // optional 1..5
status: CommentStatus;
createdAt: string; // ISO
}


export interface BlogPost {
_id: ObjectId;
title: string;
slug: string;
excerpt?: string;
content: string; // HTML or markdown string
coverUrl?: string;
categories: BlogCategory[];
tags: BlogTag[];
published: boolean;
author?: string;
createdAt: string;
updatedAt?: string;
}


export interface Paged<T> {
items: T[];
total: number;
page: number;
pageSize: number;
}