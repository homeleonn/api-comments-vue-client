<template>
    <div class="comment" :id="[`comment_${comment.id}`]">
      <div class="comment__indent" v-html="indent"></div>
      <div class="comment__content">
        <div class="comment__title">
          <img alt="Author avatar" src="./../assets/anonymous.png">
          <div class="comment__author-name">{{ authorName }}</div>
          <div class="comment__time">{{ comment.created_at }} <span v-if="comment.updated">(Изменено)</span></div>
        </div>
        <div class="comment__text">{{ comment.text }}</div>
        <div class="comment__tools">
          <button class="reply" @click="toggleAction('reply')" title="Ответить">&#10149;</button>
          <button class="update" @click="toggleAction('update')" title="Редактировать">&#9998;</button>
          <button class="destroy" @click="$emit('send', comment.id, 'destroy')" title="Удалить">&#10006;</button>
        </div>
        <CommentForm
          v-if="action"
          @send="send"
          @close="action = false"
          :comment="comment"
          :action="action"
        ></CommentForm>
      </div>
    </div>
    <div class="subcomments" v-if="comment.children && comment.children.length">
      <TheComment
        v-for="child in comment.children"
        :comment="child"
        :level="level + 1"
        @send="send"
      ></TheComment>
    </div>
</template>

<script>
import CommentForm from '@/components/CommentForm.vue'

export default {
  name: 'TheComment',

  components: {
    CommentForm
  },

  props: {
    comment: Object,
    level: {
      type: Number,
      default: 0
    }
  },

  data() {
    return {
      action: false
    }
  },

  computed: {
    indent() {
      return `<span></span>`.repeat(this.level);
    },

    title() {
      return `${this.authorName} ${this.comment.created_at}`;
    },

    authorName() {
      return this.comment.author_name ?? 'anonymous';
    }
  },

  methods: {
    toggleAction(action) {
      this.action = this.action === action ? false : action;
    },

    send(comment, action) {
      this.$emit('send', comment, action);
    }
  }
}
</script>

<style type="text/css">

.comment, .comment__indent {
  display: flex;
}

.comment {
  margin: 25px 0 0 15px;
  padding: 5px;
  transition: 1s;
}

.comment.active {
  background: rgba(0, 255, 0, .2);
}

.comment__content {
  position: relative;
  padding-bottom: 5px;
  border-bottom: 1px rgba(0, 0, 0, .1) solid;
}

.comment__title {
  margin: 0 0 5px;
  padding: 0 0 5px;
  font-weight: bold;
}

.comment__title img {
  width: 30px;
  vertical-align: middle;
}

.comment__title > div {
  display: inline;
  margin: 0 5px;
}

.comment__title > .comment__time {
  font-size: 12px;
  color: gray;
}

.comment__indent span {
  font-size: 20px;
  margin: 4px 0;
  width: 25px;
}

.comment__indent span:before {
  content: '°';
}

.comment__tools {
  margin-top: 10px;
}

.comment__tools button {
  cursor: pointer;
}

.comment__tools button:not(:last-child)  {
  margin-right: 10px;
}

@media (max-width: 600px) {
  .comment__tools button {
    font-size: 18px;
    margin-right: 30px !important;
  }
}
</style>
