'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _Three = require('./Three');

var _Three2 = _interopRequireDefault(_Three);

var _ScaleLoader = require('halogen/ScaleLoader');

var _ScaleLoader2 = _interopRequireDefault(_ScaleLoader);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var OrbitControls = require('three-orbit-controls')(_Three2.default);

var STLViewer = function (_Component) {
	_inherits(STLViewer, _Component);

	function STLViewer() {
		_classCallCheck(this, STLViewer);

		return _possibleConstructorReturn(this, (STLViewer.__proto__ || Object.getPrototypeOf(STLViewer)).apply(this, arguments));
	}

	_createClass(STLViewer, [{
		key: 'componentDidMount',
		value: function componentDidMount() {
			var _this2 = this;

			var camera = void 0,
			    scene = void 0,
			    renderer = void 0,
			    mesh = void 0,
			    distance = void 0,
			    controls = void 0;
			var _props = this.props,
			    url = _props.url,
			    width = _props.width,
			    height = _props.height,
			    modelColor = _props.modelColor,
			    backgroundColor = _props.backgroundColor,
			    orbitControls = _props.orbitControls;

			var xDims = void 0,
			    yDims = void 0,
			    zDims = void 0;
			var component = this;
			var rotate = this.props.rotate;

			init();

			/**
    * The init method for the 3D scene
    * @returns {void}
    */
			function init() {
				//Detector.addGetWebGLMessage();
				scene = new _Three2.default.Scene();
				distance = 10000;
				var directionalLight = new _Three2.default.DirectionalLight(0xffffff);
				directionalLight.position.x = 0;
				directionalLight.position.y = 0;
				directionalLight.position.z = 1;
				directionalLight.position.normalize();
				scene.add(directionalLight);

				var loader = new _Three2.default.STLLoader();
				loader.crossOrigin = '';
				loader.load(url, function (geometry) {

					// Calculate mesh noramls for MeshLambertMaterial.
					geometry.computeFaceNormals();
					geometry.computeVertexNormals();

					// Center the object
					geometry.center();

					mesh = new _Three2.default.Mesh(geometry, new _Three2.default.MeshLambertMaterial({
						overdraw: true,
						color: modelColor
					}));
					// Set the object's dimensions
					geometry.computeBoundingBox();
					xDims = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
					yDims = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
					zDims = geometry.boundingBox.max.z - geometry.boundingBox.min.z;
					if (rotate) {
						mesh.rotation.x = 5;
						mesh.rotation.z = .25;
					}
					scene.add(mesh);

					// Add the camera
					camera = new _Three2.default.PerspectiveCamera(30, width / height, 1, distance);
					camera.position.set(0, 0, Math.max(xDims * 3, yDims * 3, zDims * 3));

					scene.add(camera);

					renderer = new _Three2.default.WebGLRenderer(); //new THREE.CanvasRenderer();
					renderer.setSize(width, height);
					renderer.setClearColor(backgroundColor, 1);

					// Add controls for mouse interaction
					if (orbitControls) {
						controls = new OrbitControls(camera, _reactDom2.default.findDOMNode(component));
						controls.enableKeys = false;
						controls.addEventListener('change', orbitRender);
					}

					// Add to the React Component
					_reactDom2.default.findDOMNode(component).replaceChild(renderer.domElement, _reactDom2.default.findDOMNode(component).firstChild);

					// Start the animation
					animate();
				});
			}

			/**
    * Animate the scene
    * @returns {void}
    */
			var animate = function animate() {
				// note: three.js includes requestAnimationFrame shim
				if (rotate) {
					requestAnimationFrame(animate);
				}
				if (_this2.props.orbitControls) {
					controls.update();
				}
				render();
			};

			/**
    * Render the scene after turning off the rotation
    * @returns {void}
    */
			var orbitRender = function orbitRender() {
				if (rotate) {
					rotate = false;
				}

				render();
			};

			/**
    * Render the scene
    * @returns {void}
    */
			var render = function render() {
				if (mesh && rotate) {
					mesh.rotation.z += 0.02;
				}

				renderer.render(scene, camera);
			};
		}
	}, {
		key: 'shouldComponentUpdate',
		value: function shouldComponentUpdate(nextProps, nextState) {
			if (JSON.stringify(nextProps) === JSON.stringify(this.props)) {
				return false;
			}
			return true;
		}
	}, {
		key: 'componentWillUpdate',
		value: function componentWillUpdate(nextProps, nextState) {
			var camera = void 0,
			    scene = void 0,
			    renderer = void 0,
			    mesh = void 0,
			    distance = void 0,
			    controls = void 0;
			var url = nextProps.url,
			    width = nextProps.width,
			    height = nextProps.height,
			    modelColor = nextProps.modelColor,
			    backgroundColor = nextProps.backgroundColor,
			    orbitControls = nextProps.orbitControls;

			var xDims = void 0,
			    yDims = void 0,
			    zDims = void 0;
			var component = this;
			var rotate = nextProps.rotate;

			init();

			/**
    * The init method for the 3D scene
    * @returns {void}
    */
			function init() {
				//Detector.addGetWebGLMessage();
				scene = new _Three2.default.Scene();
				distance = 10000;
				var directionalLight = new _Three2.default.DirectionalLight(0xffffff);
				directionalLight.position.x = 0;
				directionalLight.position.y = 0;
				directionalLight.position.z = 1;
				directionalLight.position.normalize();
				scene.add(directionalLight);

				var loader = new _Three2.default.STLLoader();
				loader.crossOrigin = '';
				loader.load(url, function (geometry) {

					// Calculate mesh noramls for MeshLambertMaterial.
					geometry.computeFaceNormals();
					geometry.computeVertexNormals();

					// Center the object
					geometry.center();

					mesh = new _Three2.default.Mesh(geometry, new _Three2.default.MeshLambertMaterial({
						overdraw: true,
						color: modelColor
					}));
					// Set the object's dimensions
					geometry.computeBoundingBox();
					xDims = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
					yDims = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
					zDims = geometry.boundingBox.max.z - geometry.boundingBox.min.z;
					if (rotate) {
						mesh.rotation.x = 5;
						mesh.rotation.z = .25;
					}
					scene.add(mesh);

					// Add the camera
					camera = new _Three2.default.PerspectiveCamera(30, width / height, 1, distance);
					camera.position.set(0, 0, Math.max(xDims * 3, yDims * 3, zDims * 3));

					scene.add(camera);

					renderer = new _Three2.default.WebGLRenderer(); //new THREE.CanvasRenderer();
					renderer.setSize(width, height);
					renderer.setClearColor(backgroundColor, 1);

					// Add controls for mouse interaction
					if (orbitControls) {
						controls = new OrbitControls(camera, _reactDom2.default.findDOMNode(component));
						controls.addEventListener('change', orbitRender);
					}

					// Add to the React Component
					_reactDom2.default.findDOMNode(component).replaceChild(renderer.domElement, _reactDom2.default.findDOMNode(component).firstChild);

					// Start the animation
					animate();
				});
			}

			/**
    * Animate the scene
    * @returns {void}
    */
			var animate = function animate() {
				// note: three.js includes requestAnimationFrame shim
				if (rotate) {
					requestAnimationFrame(animate);
				}
				if (nextProps.orbitControls) {
					controls.update();
				}
				render();
			};

			/**
    * Render the scene after turning off the rotation
    * @returns {void}
    */
			var orbitRender = function orbitRender() {
				if (rotate) {
					rotate = false;
				}

				render();
			};

			/**
    * Render the scene
    * @returns {void}
    */
			var render = function render() {
				if (mesh && rotate) {
					mesh.rotation.z += 0.02;
				}

				renderer.render(scene, camera);
			};
		}
	}, {
		key: 'render',
		value: function render() {
			var _props2 = this.props,
			    width = _props2.width,
			    height = _props2.height,
			    modelColor = _props2.modelColor;


			return _react2.default.createElement(
				'div',
				{
					className: this.props.className,
					style: { width: width, height: height }
				},
				_react2.default.createElement(
					'div',
					{ style: { textAlign: 'center', marginTop: height / 2 - 8 } },
					_react2.default.createElement(_ScaleLoader2.default, { color: modelColor, size: '16px' })
				)
			);
		}
	}]);

	return STLViewer;
}(_react.Component);

STLViewer.propTypes = {
	className: _react.PropTypes.string,
	url: _react.PropTypes.string,
	width: _react.PropTypes.number,
	height: _react.PropTypes.number,
	backgroundColor: _react.PropTypes.string,
	modelColor: _react.PropTypes.string,
	rotate: _react.PropTypes.bool,
	orbitControls: _react.PropTypes.bool
};
STLViewer.defaultProps = {
	backgroundColor: '#EAEAEA',
	modelColor: '#B92C2C',
	height: 400,
	width: 400,
	rotate: true,
	orbitControls: true
};
;

module.exports = STLViewer;