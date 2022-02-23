<template>
  <div class="comments">
    <div class="comments-count">Комментариев({{ commentsCount }})</div>
    <TheComment
      v-for="comment in comments"
      :comment="comment"
      :key="comment.id"
      @send="send"
    ></TheComment>
    <CommentForm @send="send"></CommentForm>
    <div class="api-errors" v-show="errors" v-html="errors" ref="errors"></div>
  </div>
</template>

<script>
import TheComment from './components/TheComment.vue'
import CommentForm from './components/CommentForm.vue'
import { getComments, addComment, replyComment, updateComment, destroyComment } from './api.js'

let activeCommentId, errorTimer;
export default {
  name: 'App',

  components: {
    TheComment,
    CommentForm
  },

  data() {
    return {
      comments: [],
      errors: null
    }
  },

  mounted() {
    this.loadComments();
        console.log(this.$refs);
  },

  methods: {
    async send(comment, action) {
      if (!['add', 'reply', 'update', 'destroy'].includes(action)) return;
      let commentId = await this[action](comment);
      if (commentId) {
        this.showActiveComment(commentId, !['add', 'update'].includes(action));
      }
    },

    add(comment) {
      return addComment(comment, (comment, raw) => {
        if (this.checkError(comment, raw)) return;

        this.comments.push(comment);
        return comment.id;
      });
    },

    update(comment) {
      return updateComment(comment, (comment, raw) => {
        if (this.checkError(comment, raw)) return;

        let updatedComment = this.findComment(comment.id);
        delete comment.children;
        Object.assign(updatedComment, comment);
        return updatedComment.id;
      });
    },

    reply(comment) {
      return replyComment(comment, (comment, raw) => {
        if (this.checkError(comment, raw, 'reply')) return;
        
        this.findComment(comment.parent_id)?.children.push(comment);
        return comment.id;
      });
    },

    destroy(commentId) {
      destroyComment(commentId, (response, raw) => {
        this.checkError(response, raw, 'destroy');
        const deletedComment = this.findComment(commentId);
        if (!deletedComment) return;
        const clearingTree = !deletedComment.parent_id ? this.comments : this.findComment(deletedComment.parent_id).children;
        clearingTree.splice(clearingTree.findIndex(comment => comment.id === deletedComment.id), 1);
      });
    },

    showActiveComment(commentId, scrollToComment = false) {
      this.$nextTick(() => {
        setTimeout(() => {
          const newComment = document.querySelector(`#comment_${commentId}`);
          if (!newComment) return;
          if (scrollToComment) {
            window.scrollTo(0, newComment.offsetTop - window.innerHeight + newComment.offsetHeight * 2);
          }
          addTempClass(newComment, 'active', 2000);
        }, 0);
      });
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
    },

    checkError(response, raw, type = null) {
      let errorsText = '';
      if (response?.errors) {
        if (raw.status === 422) {
          try {
            for (let key in response.errors) {
              errorsText += response.errors[key].join('<br>') + '<br>';
            }
          } catch (e) { }
        }
      } else if (raw.status === 404) {
        if (type === 'destroy') {
          errorsText = 'This comment was already removed earlier';
        } else if (type === 'reply') {
          errorsText = 'Parent comment perhaps was removed';
        } else {
          errorsText = 'The comment not found';
        }
      }

      if (errorsText) {
        this.errors = errorsText;
        clearTimeout(errorTimer);
        errorTimer = addTempClass(this.$refs.errors, 'active', 10000);
        return true;
      }

      return ![200, 201].includes(raw.status);
    },

    commentsCount_(comments) {
      let count = 0;
      for (let key in comments) {
        count++;
        if (comments[key].children.length) {
          count += this.commentsCount_(comments[key].children);
        }
      }

      return count;
    }
  },

  computed: {
    commentsCount() {
      return this.commentsCount_(this.comments);
    }
  },

  watch: {
    comments: function () {
      if (activeCommentId) {
        this.showActiveComment(activeCommentId);
        activeCommentId = null;
      }
    },
  }
}

function addTempClass(el, className, time) {
  el.classList.add(className);
  return setTimeout(() => {
    el.classList.remove(className);
  }, time);
}
</script>

<style type="text/css">
.api-errors {
  position: fixed;
  top: 0;
  right: 0;
  padding: 10px;
  background: rgba(255, 0, 0, .5);
  border-radius: 0 0 0 10px;
  transition: 2s;
  display: none;
}

.api-errors.active {
  display: block;
}
</style>