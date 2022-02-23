<template>
  <div class="comments">
    <TheComment
      v-for="comment in comments"
      :comment="comment"
      :key="comment.id"
      @send="send"
    ></TheComment>
    <CommentForm @send="send"></CommentForm>
  </div>
</template>

<script>
import TheComment from './components/TheComment.vue'
import CommentForm from './components/CommentForm.vue'
import { getComments, addComment, replyComment, updateComment, destroyComment } from './api.js'

let activeCommentId;
export default {
  name: 'App',

  components: {
    TheComment,
    CommentForm
  },

  data() {
    return {
      comments: []
    }
  },

  mounted() {
    this.loadComments();
  },

  methods: {
    async send(comment, action) {
      if (!['add', 'reply', 'update', 'destroy'].includes(action)) return;
      let commentId = await this[action](comment);
      if (commentId) {
        this.showActiveComment(commentId);
      }
    },

    reply(comment) {
      return replyComment(comment, (comment, raw) => {
        if (raw.status === 201) {
          this.findComment(comment.parent_id)?.children.push(comment);
          return comment.id;
        }
      });
    },

    add(comment) {
      return addComment(comment, (comment, raw) => {
        if (raw.status === 201) {
          this.comments.push(comment);
          return comment.id;
        }
      });
    },

    update(comment) {
      updateComment(comment, (comment, raw) => {
        if (raw.status === 200) {
          let updatedComment = this.findComment(comment.id);
          delete comment.children;
          Object.assign(updatedComment, comment);
          return updatedComment.id;
        }
      });
    },

    destroy(commentId) {
      destroyComment(commentId, (_, raw) => {
        if (raw.status === 204) {
          const deletedComment = this.findComment(commentId);
          const clearingTree = !deletedComment.parent_id ? this.comments : this.findComment(deletedComment.parent_id).children;
          clearingTree.splice(clearingTree.findIndex(comment => comment.id === deletedComment.id), 1);
        }
      });
    },

    showActiveComment(commentId) {
      this.$nextTick(() => {
        setTimeout(() => {
          const newComment = document.querySelector(`#comment_${commentId}`);
          window.scrollTo(0, newComment.offsetTop - window.innerHeight + newComment.offsetHeight * 2);
          this.markActive(newComment);
        }, 0);
      });
    },

    markActive(comment) {
      const className = "active";
        comment.classList.add(className);
        setTimeout(() => {
          comment.classList.remove(className);
        }, 2000)
    },

    callback(comment, raw) {
      console.log(raw, comment);
      this.loadComments();
      if (comment) {
        activeCommentId = comment.id;
      }
    },

    async loadComments() {
      this.comments = await getComments();
    },

    // Comments tree traversal
    findComment(commentId, comments = null) {
      let comment;
      if (comments === null) comments = this.comments;
      for (let key in comments) {
        if (comments[key].id === commentId) {
          return comments[key];
        } else if (comments[key].children.length) {
          comment = this.findComment(commentId, comments[key].children);
          if (comment) return comment;
        }
      }

      return comment;
    }
  },

  watch: {
    comments: function () {
      if (activeCommentId) {
        this.showActiveComment(activeCommentId);
        activeCommentId = null;
      }
    }
  }
}
</script>
