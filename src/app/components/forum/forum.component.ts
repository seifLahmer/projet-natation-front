import { Component, OnInit } from '@angular/core';
import { Thread } from '../../models/Thread';
import { Post } from '../../models/Post';
import { Comment } from '../../models/Comment';
import { AuthService } from '../../services/_services/auth.service';
import { ForumService } from '../../services/ForumService';

@Component({
  selector: 'app-forum',
  templateUrl: './forum.component.html',
  styleUrls: ['./forum.component.css']
})



export class ForumComponent implements OnInit {
  threads: Thread[] = [];
  selectedThread: Thread | null = null;
  posts: Post[] = [];
  selectedPostId: number | null = null;
  comments: Comment[] = [];

  newThreadTitle: string = '';
  newPostContent: string = '';
  newCommentContent: string = '';

  constructor(private forumService: ForumService) {}

  ngOnInit(): void {
    this.loadThreads();
  }

  loadThreads(): void {
    this.forumService.getAllThreads().subscribe({
      next: (data) => this.threads = data,
      error: (err) => console.error('Error loading threads:', err)
    });
  }

  selectThread(thread: Thread): void {
    this.selectedThread = thread;
    this.forumService.getPostsByThreadId(thread.id!).subscribe({
      next: (data) => this.posts = data,
      error: (err) => console.error('Error loading posts:', err)
    });
    this.comments = [];
  }

  createThread(): void {
    if (!this.newThreadTitle.trim()) return;
    this.forumService.createThread(this.newThreadTitle).subscribe({
      next: () => {
        this.newThreadTitle = '';
        this.loadThreads();
      },
      error: (err) => console.error('Error creating thread:', err)
    });
  }

  createPost(): void {
    if (!this.selectedThread || !this.newPostContent.trim()) return;
    this.forumService.createPost(this.selectedThread.id!, this.newPostContent).subscribe({
      next: () => {
        this.newPostContent = '';
        this.selectThread(this.selectedThread!); // reload posts
      },
      error: (err) => console.error('Error creating post:', err)
    });
  }

  loadComments(postId: number): void {
    this.selectedPostId = postId;
    this.forumService.getCommentsByPostId(postId).subscribe({
      next: (data) => this.comments = data,
      error: (err) => console.error('Error loading comments:', err)
    });
  }

  createComment(): void {
    if (!this.selectedPostId || !this.newCommentContent.trim()) return;
    this.forumService.createComment(this.selectedPostId, this.newCommentContent).subscribe({
      next: () => {
        this.newCommentContent = '';
        this.loadComments(this.selectedPostId!); // reload comments
      },
      error: (err) => console.error('Error creating comment:', err)
    });
  }
  editingPostId: number | null = null;
editedPostContent: string = '';

startEditPost(post: Post): void {
  this.editingPostId = post.id!;
  this.editedPostContent = post.content;
}

cancelEditPost(): void {
  this.editingPostId = null;
  this.editedPostContent = '';
}



deletePost(postId: number): void {
  this.forumService.deletePost(postId).subscribe({
    next: () => this.selectThread(this.selectedThread!),
    error: err => console.error("Error deleting post", err)
  });
}
editingThread: Thread | null = null;

startEditThread(thread: Thread): void {
  this.editingThread = { ...thread };
}

cancelEditThread(): void {
  this.editingThread = null;
}

updateThread(): void {
  if (!this.editingThread) return;
  this.forumService.updateThread(this.editingThread).subscribe({
    next: () => {
      this.editingThread = null;
      this.loadThreads();
    },
    error: err => console.error("Error updating thread", err)
  });
}

deleteThread(id: number): void {
  this.forumService.deleteThread(id).subscribe({
    next: () => this.loadThreads(),
    error: err => console.error("Error deleting thread", err)
  });
}
// POST - Update
updatePost(): void {
  if (!this.editingPostId || !this.editedPostContent.trim()) return;
  this.forumService.updatePost(this.editingPostId, this.editedPostContent).subscribe({
    next: () => {
      this.editingPostId = null;
      this.selectThread(this.selectedThread!);
    },
    error: err => console.error("Error updating post", err)
  });
}


}
