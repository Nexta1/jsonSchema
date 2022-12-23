<template>
  <div class="main">
    <div  class="row">
      <span :style="{ marginLeft: deep * 20 + 'px' }" >
        <i
          :class="{
            'el-icon-caret-right': hidden,
            'el-icon-caret-bottom': !hidden,
          }"
          @click="hidden = !hidden"
          style="font-size: 20px;cursor: pointer;color: #303133"
          v-if="pickValue.type === 'object'"
        />
         <span v-else style="width:20px;display:inline-block"></span>
      </span>
      <input
          :value="pickKey"
          @change="changeKey"
          :disabled="root || isItem"
          class="input"
      />
      <el-tooltip content="是否必须" placement="top">
      <label class="label" v-if="!root">
        <input
          type="checkbox"
          :checked="required"
          @change="change"
          :disabled="isItem"
        />
        <i class="check"></i>
      </label>
      </el-tooltip>
      <el-tooltip content="全选" placement="top">
      <label class="label" v-if="root">
        <input type="checkbox" @change="rootChange" />
        <i class="check"></i>
      </label>
      </el-tooltip>
      <el-select
        v-model="pickValue.type"
        placeholder="请选择"
        @change="changeType"
        :disabled="root"
        class="select"
      >
        <el-option
          v-for="item in TYPE_NAME"
          :key="item.value"
          :label="item.value"
          :value="item.value"
        >
        </el-option>
      </el-select>
      <input placeholder="标题" v-model="pickValue.title" class="input" />
      <el-tooltip content="高级设置" placement="top">
        <i
            class="el-icon-setting"
            @click="setting"
            style="margin: 0 5px; cursor: pointer; color: #409eff"
        />
      </el-tooltip>
      <el-tooltip content="增加子节点" placement="top">
      <i
        class="el-icon-plus"
        @click="addChild"
        v-if="pickValue.type === 'object'"
        style="cursor: pointer; color: #67c23a;font-weight: 900"
      />
      </el-tooltip>
      <el-tooltip content="删除节点" placement="top">
      <i
        class="el-icon-close"
        @click="removeKey"
        v-if="!root"
        style="margin: 0 5px; font-weight: 900; color: #f56c6c; cursor: pointer"
      />
      </el-tooltip>
    </div>

    <template
      v-if="!hidden && pickValue.type !== 'array' && pickValue.properties"
    >
      <json-schema
        v-for="(value, key, index) in pickValue.properties"
        :value="{ [key]: value }"
        :key="index"
        :deep="deep + 1"
        :parent="pickValue"
        :root="false"
      />
    </template>
    <template v-if="pickValue.type === 'array'">
      <json-schema
        :value="{ items: pickValue.items }"
        :deep="deep + 1"
        :root="false"
        isItem
      />
    </template>

    <el-dialog title="高级设置" :visible.sync="dialogVisible">
      <el-form :model="advancedValue" :inline="true">
        <h3 class="h3">基础配置</h3>
        <el-form-item
          v-for="(value, key) in advancedValue"
          :key="key"
          :label="advancedAttr[key].name"
        >
          <el-input
            v-model.number="advancedValue[key]"
            v-if="
              advancedAttr[key].type === 'integer' ||
              advancedAttr[key].type === 'number'
            "
          ></el-input>
          <textarea
            class="textarea"
            :value="enumText"
            v-else-if="key === 'enum'"
            @change="changeEnum"
          />
          <el-switch
            v-else-if="advancedAttr[key].type === 'boolean'"
            v-model="advancedValue[key]"
            active-color="#13ce66"
            inactive-color="#ff4949"
          >
          </el-switch>
          <el-select
            v-model="advancedValue[key]"
            placeholder="请选择"
            v-else-if="key === 'format'"
          >
            <el-option
              v-for="item in advancedAttr[key].enums"
              :key="item"
              :label="item"
              :value="item"
            >
            </el-option>
          </el-select>
          <el-input v-model="advancedValue[key]" v-else></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="ok">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { TYPE_NAME, TYPE } from "@/components/type/type";
import { isNull } from "@/components/utils";

export default {
  name: "JsonSchema",
  props: {
    value: {
      type: Object,
      require: true,
    },
    deep: {
      type: Number,
      default: 0,
    },
    parent: {
      type: Object,
    },
    root: {
      type: Boolean,
      default: true,
    },
    isItem: {
      //是否数组元素
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      hidden: false,
      checked: false,
      type: "string",
      TYPE_NAME,
      countAdd: 1,
      dialogVisible: false,
      advancedValue: {},
    };
  },
  methods: {
    _joinName() {
      return `field_${this.deep}_${this.countAdd++}`;
    },
    addChild() {
      this.hidden = false;
      const name = this._joinName();
      const type = "string";
      const node = this.pickValue;
      node.properties || this.$set(node, "properties", {});
      const props = node.properties;
      this.$set(props, name, { type: type });
    },
    removeKey() {
      const { properties } = this.parent;
      this.$delete(properties, this.pickKey);
    },
    change(e) {
      const value = e.target.checked;
      this.parent.required || this.$set(this.parent, "required", []);
      const required = this.parent.required;
      if (value) {
        required.includes(this.pickKey) || required.push(this.pickKey);
      } else {
        const index = required.indexOf(this.pickKey);
        index >= 0 && required.slice(index, 1);
      }
      required.length === 0 && this.$delete(parent, "required");
    },
    rootChange(e) {
      this._rootChange(e.target.checked, this.pickValue);
    },
    _rootChange(checked, node) {
      if (node.properties) {
        console.log(checked);
        checked
          ? this.$set(node, "required", Object.keys(node.properties))
          : this.$delete(node, "required");
        Object.keys(node.properties).forEach((key) => {
          this._rootChange(checked, node.properties[key]);
        });
      }
      //todo 数组
    },
    changeKey(val) {
      //改用原生
      const newKey = val.target.value;
      if (newKey === this.pickKey) {
        return;
      }
      const oldKey = this.pickKey;
      const entries = Object.entries(this.parent.properties);
      const find = entries.find((i) => i[0] === oldKey);
      find[0] = newKey;
      const p = Object.fromEntries(entries);
      this.$delete(this.parent, "properties");
      this.$set(this.parent, "properties", p);
      const requires = this.parent.required || [];
      const index = requires.indexOf(oldKey);
      if (index >= 0 && requires.length > 0) {
        requires.splice(index, 1);
        requires.push(newKey);
        this.$set(this.parent, "required", [...new Set(requires)]);
      }
    },
    setting() {
      this.dialogVisible = true;
      this.advancedValue = { ...this.advanced.value };
      console.log(this.advancedValue);
      for (const i in this.advancedValue) {
        if (this.pickValue[i]) {
          this.advancedValue[i] = this.pickValue[i];
        }
      }
      // todo 自定义属性
    },
    changeEnum(e) {
      const type = this.pickValue.type;
      const value = e.target.value.split("\n");
      if (value[value.length - 1] === "") {
        value.pop();
      }
      if ((value.length === 1 && value[0] === "") || value.length === 0) {
        this.advancedValue.enum = null;
      }
      if (type === "string") {
        this.advancedValue.enum = value;
      } else {
        this.advancedValue.enum = value.map((item) => +item);
      }
    },
    changeType(type) {
      this.advancedValue = {};
      if (type === "array") {
        this.$set(this.pickValue, "items", { type: "string" });
      }
      const res = Object.keys(this.pickValue).filter((i) => {
        return !Object.keys(TYPE[type].value)
          .concat(["title", "type", "items"])
          .includes(i);
      });
      for (const i of res) {
        if (Object.keys(this.pickValue).includes(i)) {
          this.$delete(this.pickValue, i);
        }
      }
      console.log(this.pickValue);
    },
    ok() {
      this.dialogVisible = false;
      for (const i in this.advancedValue) {
        const res = isNull(this.advancedValue[i]);
        if (res) {
          this.$delete(this.pickValue, i);
        } else {
          this.$set(this.pickValue, i, this.advancedValue[i]);
        }
      }
      // todo 自定义属性
    },
  },
  computed: {
    //每一个属性的值
    pickValue() {
      return Object.values(this.value)[0];
    },
    //每一个属性的键
    pickKey() {
      return Object.keys(this.value)[0];
    },
    required() {
      return (
        this.parent &&
        this.parent.required &&
        this.parent.required.indexOf(this.pickKey) >= 0
      );
    },
    advanced() {
      return TYPE[this.pickValue.type];
    },
    advancedAttr() {
      return TYPE[this.pickValue.type].attr;
    },
    enumText() {
      const txt = this.advancedValue["enum"];
      if (!txt || txt.length === 0) {
        return "";
      } else {
        return txt.join("\n");
      }
    },
  },
};
</script>
<style scoped>

::v-deep .el-select .el-input .el-select__caret {
  line-height: 20px;
}
::v-deep .el-input__inner {
  height: 30px;
}
.input {
  height: 30px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  padding: 0 15px;
  box-sizing: border-box;
  margin: 0 6px;
}
.input:focus {
  border-color: #409eff;
  outline: 0;
}
.input:disabled{
  background: #F5F7FA;
  cursor: not-allowed;

}
.textarea {
  border: 1px solid #dcdfe6;
  box-sizing: border-box;
  border-radius: 4px;
  padding: 5px 15px;
  min-height: 30px;
  min-width: 168px;
  margin-left: 6px;
}
.textarea:focus {
  border-color: #409eff;
  outline: 0;
}
::v-deep  .el-input__inner {
  min-width: 120px;
  max-width: 150px;
  margin: 0 6px;
}
::v-deep  .select .el-input__inner {
  width: 100px;
  margin: 0 6px;
}
#check {
  margin: 0 10px;
}

.h3 {
  border-left: 5px solid #409eff;
  padding-left: 10px;
}
::v-deep .el-dialog__body {
  padding: 0 20px;
}
::v-deep .el-dialog {
  min-width: 600px;
}
::v-deep .el-form-item__label {
  padding: 0;
}
.label {
  display: inline-flex;
  align-items: center;
  margin: 1em 0.5em;
}
.label input[type="checkbox"] {
  display: none;
}
.label input[type="checkbox"] + .check {
  width: 12px;
  height: 12px;
  border: 1px solid #dcdfe6;
  transition: 0.2s ease;
  border-radius: 2px;
  position: relative;
}
.label input[type="checkbox"]:checked + .check {
  background-color: #409eff;
  border-color: #409eff;
}
.check::after {
  box-sizing: content-box;
  content: "";
  border: 1px solid #fff;
  border-left: 0;
  border-top: 0;
  height: 7px;
  left: 4px;
  position: absolute;
  top: 1px;
  transform: rotate(45deg) scaleY(0);
  width: 3px;
  transition: transform 0.15s ease-in 0.05s;
  transform-origin: center;
}
.label input[type="checkbox"]:checked + .check::after {
  transform: rotate(45deg) scaleY(1);
}
.label input[type="checkbox"]:disabled + .check::after {
  transform: rotate(45deg) scaleY(1);
}
.label input[type="checkbox"]:disabled + .check {
  cursor: not-allowed;
  color: #c0c4cc;
}
</style>
