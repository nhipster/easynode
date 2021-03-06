'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var assert = require('assert');
var logger = using('easynode.framework.Logger').forFile(__filename);
var GenericObject = using('easynode.GenericObject');
var ModelField = using('easynode.framework.mvc.ModelField');
var util = require('util');
var S = require('string');
var _ = require('underscore');

(function () {
  /**
   * Class Model
   *
   * @class easynode.framework.mvc.Model
   * @extends easynode.GenericObject
   * @since 0.1.0
   * @author hujiabao
   * */

  var Model = function (_GenericObject) {
    _inherits(Model, _GenericObject);

    /**
     * 构造函数。
     *
     * @method 构造函数
     * @since 0.1.0
     * @author hujiabao
     * */

    function Model(schema, view) {
      _classCallCheck(this, Model);

      // 调用super()后再定义子类成员。

      var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Model).call(this));

      assert(schema && typeof schema == 'string', 'Invalid schema name');
      _this._fields = {};
      _this._fieldNames = [];
      _this._schema = schema;
      _this._view = view || schema;
      _this._idField = null;
      _this._values = {};
      _this.defineFields();
      return _this;
    }

    /**
     * 定义模型字段，子类可以覆盖该函数以在创建子类模型实例时即定义好字段。
     *
     * @method defineFields
     * @abstract
     * @protected
     * @since 0.1.0
     * @author hujiabao
     * */


    _createClass(Model, [{
      key: 'defineFields',
      value: function defineFields() {}

      /**
       * 获取模型对应的Schema名称。
       *
       * @method getSchema
       * @return {String} schema名称
       * @since 0.1.0
       * @author hujiabao
       * */

    }, {
      key: 'getSchema',
      value: function getSchema() {
        return this._schema;
      }

      /**
       * 获取模型对应的view的名称，这里的View指的是关系数据库的视图。
       *
       * @method getView
       * @return {String} view名称
       * @since 0.1.0
       * @author hujiabao
       * */

    }, {
      key: 'getView',
      value: function getView() {
        return this._view;
      }

      /**
       * 判定模型的视图是否为原生SQL视图。
       *
       * @method isRawView
       * @return {boolean} 模型的视图是否为原生SQL视图。原生视图匹配^SELECT\s+.*正则
       * @since 0.1.0
       * @author hujiabao
       * */

    }, {
      key: 'isRawView',
      value: function isRawView() {
        return this._view.match(/^\s*SELECT\s+.*/i);
      }

      /**
       * 定义一个模型字段，可链式调用。
       *
       * @method defineField
       * @param {String/easynode.framework.mvc.ModelField} name 字段名或字段实例，
       *                              当只传递name参数时，name被 认为是一个字段实例。
       *                              注意：字段命名请一律使用驼峰命名
       * @param {String} type 字段类型, easynode.framework.mvc.ModelField.TYPE_*枚举
       * @param {int} maxLength 最大长度(in bytes)，默认0
       * @param {Object} defaultValue 默认值，默认null
       * @param {boolean} nullable 可否为空,　默认true
       * @param {String} comment 注释, 默认''（空字符串）
       * @param {boolean} readonly 是否为只读字段，只读字段只出现在查询和读取时，忽略其在写入时的行为
       * @since 0.1.0
       * @author hujiabao
       * */

    }, {
      key: 'defineField',
      value: function defineField(name, type) {
        var maxLength = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
        var defaultValue = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];
        var nullable = arguments.length <= 4 || arguments[4] === undefined ? false : arguments[4];
        var comment = arguments.length <= 5 || arguments[5] === undefined ? '' : arguments[5];
        var readonly = arguments.length <= 6 || arguments[6] === undefined ? false : arguments[6];

        var field = null;
        if (arguments.length == 1) {
          field = name;
        } else {
          field = new ModelField(name, type, maxLength, defaultValue, nullable, comment, readonly);
        }
        if (this._fields[field.name]) {
          logger.warn('Duplicated model field [' + field.name + ']');
        }
        this._fields[field.name] = field;
        this._fieldNames.push(field.name);
        // this.setFieldValue(field.name);
        return this;
      }

      /**
       * 设置主键字段名
       *
       * @method setIdentifyField
       * @param {String} name 主键字段名
       * @since 0.1.0
       * @author hujiabao
       * */

    }, {
      key: 'setIdentifyField',
      value: function setIdentifyField(name) {
        var field = this._fields[name];
        assert(field, 'Field [' + name + '] is not found');
        this._idField = field;
      }

      /**
       * 获取主键字段名
       *
       * @method getIdentifyField
       * @return {String} 主键字段名
       * @since 0.1.0
       * @author hujiabao
       * */

    }, {
      key: 'getIdentifyField',
      value: function getIdentifyField() {
        if (this._idField) {
          return this._idField.name;
        }

        var defaultIdField = EasyNode.config('easynode.framework.mvc.model.defaultIdFieldName', 'id');
        var f = null;
        for (var field in this._fields) {
          field = this._fields[field];
          if (field.name == defaultIdField) {
            this._idField = field;
            f = field.name;
          }
        }
        assert(f, 'Identify of model [' + this._table + '] is not found');
        EasyNode.DEBUG && logger.debug('identify field auto-matched [' + this.getClassName() + '] [' + f + ']');
        return f;
      }

      /**
       * 获取主键字段值
       *
       * @method getId
       * @return {String/int} 主键字段值
       * @since 0.1.0
       * @author hujiabao
       * */

    }, {
      key: 'getId',
      value: function getId() {
        return this.getFieldValue(this.getIdentifyField());
      }

      /**
       * 设置主键字段值
       *
       * @method setId
       * @param {String/int} id 主键字段值
       * @since 0.1.0
       * @author hujiabao
       * */

    }, {
      key: 'setId',
      value: function setId(id) {
        assert(typeof id != null, 'Invalid identify field value');
        this.setFieldValue(this.getIdentifyField(), id);
      }

      /**
       * 获取字段列表，字段列表的顺序取决于定义的顺序。
       *
       * @method getFieldNames
       * @param {boolean} all 是否返回所有字段名，true：返回所有字段名，false：仅返回非只读字段。
       * @return {Array} 模型字段列表
       * @since 0.1.0
       * @author hujiabao
       * */

    }, {
      key: 'getFieldNames',
      value: function getFieldNames() {
        var all = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

        if (all) {
          return this._fieldNames.slice(0);
        } else {
          var arr = this._fieldNames.slice(0);
          var nonRO = [];
          for (var field in this._fields) {
            field = this._fields[field];
            if (field.readonly == false) {
              nonRO.push(field.name);
            }
          }
          var ret = [];
          arr.forEach(function (f) {
            if (_.contains(nonRO, f)) {
              ret.push(f);
            }
          });
          return ret;
        }
      }

      /**
       * 获取字段定义
       *
       * @method getFieldDefinition
       * @return {easynode.framework.mvc.ModelField} 字段定义
       * @since 0.1.0
       * @author hujiabao
       * */

    }, {
      key: 'getFieldDefinition',
      value: function getFieldDefinition(name) {
        var field = this._fields[name];
        assert(field, 'Field [' + name + '] is not defined');
        return field;
      }

      /**
       * 获取字段值
       *
       * @method getFieldValue
       * @return {Object} 字段值
       * @since 0.1.0
       * @author hujiabao
       * */

    }, {
      key: 'getFieldValue',
      value: function getFieldValue(name) {
        assert(typeof name == 'string', 'Invalid argument');
        var val = this._values[name];
        // assert(val !== undefined, `field [${name}] is not defined`);
        return val;
      }

      /**
       * 设置字段值
       *
       * @method setFieldValue
       * @param {String} name 字段名
       * @param {Object} value 字段值
       * @since 0.1.0
       * @author hujiabao
       * */

    }, {
      key: 'setFieldValue',
      value: function setFieldValue(name) {
        var value = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

        assert(typeof name == 'string', 'Invalid argument');
        var field = this._fields[name];
        assert(field, 'Field [' + name + '] is not found');
        var val = value || field.defaultValue;
        switch (field.type) {
          case ModelField.TYPE_STRING:
            {
              assert(val == null || typeof val == 'string', 'Invalid field type, need [String]');
              val = val || (field.nullable ? null : '');
              break;
            }
          case ModelField.TYPE_INT:
            {
              val = parseInt(val) || (field.nullable ? null : 0);
              break;
            }
          case ModelField.TYPE_FLOAT:
            {
              val = parseFloat(val) || (field.nullable ? null : 0);
              break;
            }
          case ModelField.TYPE_DATE:
          case ModelField.TYPE_DATETIME:
            {
              if (typeof val == 'string') {
                val = new Date(Date.parse(val));
              }
              val = val || (field.nullable ? null : new Date(0));
              break;
            }
          case ModelField.TYPE_JSON:
            {
              if (typeof val == 'string') {
                try {
                  val = JSON.parse(val);
                } catch (e) {
                  logger.error('not a valid json string\n' + val);
                  val = {};
                }
              }
              assert(val == null || (typeof val === 'undefined' ? 'undefined' : _typeof(val)) == 'object', 'Invalid field type, need [JSON Object]');
              val = val || (field.nullable ? null : {});
              break;
            }
          default:
            {
              throw new Error('Invalid field type [' + field.type + ' => ' + val + ']');
            }
        }
        this._values[name] = val;
      }

      /**
       * 使用JSON快速设置所有的字段值，可链式调用
       *
       * @method merge
       * @param {Object} obj JSON对象，属性名应与要设置的字段同名
       * @since 0.1.0
       * @author hujiabao
       * */

    }, {
      key: 'merge',
      value: function merge(obj) {
        for (var name in obj) {
          var field = this.getFieldDefinition(name);
          if (field) {
            this.setFieldValue(name, obj[name]);
          } else {
            logger.warn('Can not merge attribute [' + name + '] to model, field is not defined');
          }
        }
        return this;
      }

      /**
       * 使用JSON快速设置所有的字段值，可链式调用，merge函数的别名函数。
       *
       * @method parse
       * @param {Object} obj JSON对象，属性名应与要设置的字段同名
       * @since 0.1.0
       * @author hujiabao
       * */

    }, {
      key: 'parse',
      value: function parse(obj) {
        return this.merge(obj);
      }

      /**
       * 获取字段所有值。
       *
       * @method getFieldValues
       * @return {Object} 字段值。
       * @since 0.1.0
       * @author hujiabao
       * */

    }, {
      key: 'getFieldValues',
      value: function getFieldValues() {
        return _.clone(this._values);
      }

      /**
       * 根据模型定义，格式化值，主要是JSON对象的格式化，其他字段只要和数据库定义匹配即能够获得正确的类型
       *
       * @method normalizeJSON
       * @param {easynode.framework.mvc.Model} model 模型
       * @param {Object} values model数据
       * @return {easynode.framework.mvc.Model} 新的模型
       * @static
       * @since 0.1.0
       * @author hujiabao
       * */

    }, {
      key: 'getClassName',
      value: function getClassName() {
        return EasyNode.namespace(__filename);
      }
    }], [{
      key: 'normalizeJSON',
      value: function normalizeJSON(model) {
        var values = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        for (var fieldName in values) {
          var field = model._fields[fieldName];
          if (field && field.type == ModelField.TYPE_JSON) {
            var val = values[fieldName];
            try {
              values[fieldName] = JSON.parse(val);
            } catch (e) {
              logger.error('Invalid json string :\n' + val);
            }
          }
        }
        return values;
      }
    }]);

    return Model;
  }(GenericObject);

  module.exports = Model;
})();