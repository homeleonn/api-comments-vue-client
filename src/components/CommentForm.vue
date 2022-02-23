<template>
  <form method="post" class="comment-form">
    <div class="action" v-if="actionTitle">{{ actionTitle }} <div class="close" @click.stop="close" title="Скрыть форму">&#10006;</div></div>
    <input v-model="author_name" type="text" name="author_name" placeholder="Ваше имя">
    <textarea v-model="text" name="text" placeholder="Текст комментария*"></textarea>
    <button @click.prevent="send">Отправить</button>
    <span v-if="error" class="error">{{ error }}</span>
  </form>
</template>

<script>
let action = false;

export default {
  props: {
    comment: {
      type: Object,
      default: () => {}
    },

    action: {
      type: String,
      default: 'add'
    }
  },

  emits: ['send', 'close'],

  data() {
    return {
      author_name: '',
      text: '',
      error: null
    }
  },

  updated() {
    if (this.action !== action) {
      action = this.action;
      this.init();
    }
  },

  mounted() {
    this.init();
  },

  computed: {
    actionTitle() {
      return this.isEdit ? 'Редактирование' : (this.isReply ? `Ответ @${this.replyAuthorName}` : '');
    },

    isEdit() {
      return this.action === 'update';
    },

    isReply() {
      return this.action === 'reply';
    },

    replyAuthorName() {
      return this.comment.author_name ?? 'anonymous';
    }
  },

  methods: {
    close() {
      this.$emit('close');
    },

    init() {
      if (this.isEdit) {
        this.author_name = this.replyAuthorName;
        this.text = this.comment.text;
      } else if (this.isReply) {
        this.author_name = '';
        this.text = `@${this.replyAuthorName}, hello my dear friend!`;
      }
    },

    send() {
      if (this.text === '') {
        this.error = 'Текст комментария обязателен';
        return;
      }

      let comment = {
        author_name:  this.author_name,
        text:         this.text,
      };

      if (this.isEdit) {
        comment.id = this.comment.id;
      } else if (this.isReply) {
        comment.parent_id = this.comment.id;
      }

      this.$emit('send', comment, this.action);
      this.close();
      this.author_name = '';
      this.text = '';
      this.error = null;
    }
  }
}
</script>

<style>
  .comment-form {
    margin: 20px;
    padding: 10px;
    background: #e3ffe3;
    border-radius: 10px;
    display: inline-block;
  }

  .comment-form > * {
    display: block;
    margin: 10px 0;
    padding: 5px;
  }

  .comment-form .close {
    float: right;
    cursor: pointer;
  }

  .comment-form textarea {
    width: 500px;
    height: 100px;
  }

  .error {
    color: red;
  }

  @media (max-width: 600px) {
    .comment-form {
      min-width: 85%;
    }

    .comment-form textarea {
      width: 90%;
    }

    .comment__content .comment-form {
      position: relative;
      left: 0;
    }
  }
</style>
