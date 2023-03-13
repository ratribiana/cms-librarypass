import { Component, OnInit, Input, EventEmitter, Output, HostListener } from '@angular/core';
import { fabric } from 'fabric';

enum drawingTool {
  zoomIn = 'zoom-in',
  zoomOut = 'zoom-out',
  square = 'square',
  circle = 'circle',
  polygon = 'polygon',
  addPoint = 'add-point',
  pan = 'pan',
  pick = 'pick',
  reset = 'reset'
}


@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css']
})
export class CanvasComponent implements OnInit {
  @Input() entries: any[] = [];
  @Input() imageUrl: string = '';
  @Input() lastEntryId: number = 0;
  @Output() updateEntries = new EventEmitter();
  @Output() canvasRendered = new EventEmitter();
  @Output() isFocusingObject = new EventEmitter();
  @Output() screenResized = new EventEmitter();

  

  canvas: any;
  canvasDefaultWidth = 580;
  canvasDefaultHeight = 450;
  canvasWidth = 580;
  canvasHeight = 450;
  canvasScale = 1;
  currentImage: any; // handles the property of image
  defaultLineColor = 'red'; // default color of lines and label
  defaultStrokeWidth = 2;

  linesInPolygon = [];
  currentPolygonLine: any; // current line for polygon creation
  currentPolygonShape: any; // current shape of created polygon
  pointsInPolygon = [];
  isCreatingPolygon = false;

  allObjects = [];
  currentShape: any; // selected shape or polygon
  currentShapeIndex: number;  // index of the current polygon in relation to canvas objects
  isEditingShape: boolean = false; // when edit a particular object not related to creation or canvas
  mouseCursor: any;
  selectedTool = 'pick';
  resizeScreenDetected: any;

  isDragging = false;
  selection = false;
  lastPosX = 0;
  lastPosY = 0;

  tagMouseDown = false;
  mouseX = 0;
  mouseY = 0;
  drawingMode = true;
  id_prefix = 'udev_'
  constructor() { }

  ngOnInit() {
    this.canvasDefaultHeight = window.innerHeight;
    this.canvasHeight = window.innerHeight;
    this.canvasDefaultWidth = document.getElementById('canvas_container').offsetWidth - 100;
    this.canvasWidth = document.getElementById('canvas_container').offsetWidth - 100;

    this.canvas = new fabric.Canvas('canvas');
    this.setCanvasSize({ height: this.canvasHeight, width: this.canvasWidth })
    this.setCanvasImage(this.imageUrl);
    this.initCanvasMouseEvent();
    this.initCanvasObjectEvent();

  }
  /**
   * lets listen incase there is a change in screen
   */
  @HostListener('window:resize', ['$event'])
  onResize(event) {

    if (this.resizeScreenDetected) {
      clearTimeout(this.resizeScreenDetected);
    }

    this.resizeScreenDetected = setTimeout(() => {
      this.canvasDefaultHeight = window.innerHeight;
      this.canvasHeight = window.innerHeight;
  
      this.canvasDefaultWidth = document.getElementById('canvas_container').offsetWidth - 100;
      this.canvasWidth = document.getElementById('canvas_container').offsetWidth - 100;
      this.screenResized.emit(true);
    }, 500)
  
  }

  /**  
   * set drawing tool is currently use 
   */
  setDrawingTool(tool: drawingTool) {
    // make sure to initialize this to normal mode
    this.isDragging = false;
    this.canvas.defaultCursor = 'crosshair';

    if(tool == 'reset') {
      this.canvas.setViewportTransform([1,0,0,1,0,0]); 
    }

    if (tool == 'pick') {
      this.setPickMode();
      return;
    }

    if (tool == 'zoom-in') {
      this.zoomIn();
      return;
    }

    if (tool == 'zoom-out') {
      this.zoomOut();
      return;
    }

    if (tool == 'polygon') {
      this.isCreatingPolygon = true;
    }

    if (tool == 'pan') {
      this.setPanMode()
    }

    if (tool == 'add-point') {
      this.canvas.discardActiveObject().renderAll()
    }

    this.selectedTool = tool;
    this.drawingMode = true;

  }

  /**
   * setting for picking mode
   */
  setPickMode() {
    this.isEditingShape = true;
    this.drawingMode = false;
    this.isDragging = false;
    this.canvas.defaultCursor = 'auto';
    this.canvas.getObjects().forEach(obj => {
      obj.selectable = true;
      obj.hasControls = false;
    });
    this.setEditingCanvasMode(false);
  }

  /**
   * settings for panning
   */
  setPanMode() {
    this.canvas.defaultCursor = 'grab';
    this.canvas.getObjects().forEach(obj => {
      obj.selectable = false;
    });
    this.canvas.renderAll();
  }

  /** 
   * this will set image in canvas 
  */
  async setCanvasImage(url: string) {
    if (url && url.length > 0) {
      await this.getImageFromUrl(url);
      this.canvasHeight = this.canvasDefaultHeight;
      this.canvasWidth = this.canvasDefaultWidth
      this.scaleImageToCanvas();
      this.canvasRendered.emit(true);
    }
  }

  getImageFromUrl(url: string) {
    return new Promise(resolve => {
      fabric.Image.fromURL(url, (img: any) => {
        this.currentImage = img;
        return resolve(0);
      });
    });
  }


  /**
   * Lets update our entries
   */
  setPolygonDataToEntries(keyIndex) {
    return new Promise(resolve => {
      let objToSave;

      this.canvas.getObjects().forEach(obj => {
        if (obj.id == this.id_prefix + keyIndex) {
          objToSave = obj;
          return;
        }
      })

      if (!objToSave) {
        return resolve(0);
      }

      let updatedEntry = [];
      this.entries.forEach((kf, i) => {
        updatedEntry[i] = kf;
        if (kf.id == keyIndex) {

          if (kf.data.shape_type == 'square') {
            objToSave.height = objToSave.height * objToSave.scaleY;
            objToSave.width = objToSave.width * objToSave.scaleX;
          }

          if (kf.data.shape_type == 'circle') {
            objToSave.ry = objToSave.ry * objToSave.scaleY;
            objToSave.rx = objToSave.rx * objToSave.scaleX;
          }

          let data = this.setPolygonData(kf.id, kf.data.shape_type, objToSave, kf.is_new);
          updatedEntry[i].data = data.data;
          updatedEntry[i].is_selected = false;
          updatedEntry[i].edit_this = false;
        }
      });
      return resolve(updatedEntry);
    });
  }

  /** initialize mouse event  */
  initCanvasMouseEvent() {

    /** ON MOUSE DOWN */
    this.canvas.on('mouse:down', (o: any) => {
      if (!this.selectedTool || this.selectedTool == 'pick') return;
      if (!this.drawingMode) return;

      if (this.selectedTool == 'pan') {
        var evt = o.e;
        this.isDragging = true;
        this.selection = false;
        this.lastPosX = evt.clientX;
        this.lastPosY = evt.clientY;
        this.canvas.defaultCursor = 'grabbing';
        return;
      }


      this.tagMouseDown = true;
      let pointer = this.canvas.getPointer(o.e);

      if (this.selectedTool == 'square') {
        this.createSquare(pointer);
      }

      if (this.selectedTool == 'circle') {
        this.createCircle(pointer);
      }

      if (this.selectedTool == 'polygon' && this.isCreatingPolygon) {
        if (o.target && o.target.id == this.pointsInPolygon[0].id) {
          this.createPolygon(pointer);
        } else {
          this.addPolygonPoint(o);
          return;
        }

      }

      // lets add the label
      this.canvas.add(this.currentShape);

    });

    /** ON MOUSE MOVE */
    this.canvas.on('mouse:move', (o: any) => {
      if (!this.selectedTool || this.selectedTool == 'pick') return;

      if (this.selectedTool == 'pan' && this.isDragging) {
        var e = o.e;
        var vpt = this.canvas.viewportTransform;
        vpt[4] += e.clientX - this.lastPosX;
        vpt[5] += e.clientY - this.lastPosY;
        this.canvas.requestRenderAll();
        this.lastPosX = e.clientX;
        this.lastPosY = e.clientY;
        return;
      }

      // editing current polygon or shape to add points
      if (this.selectedTool == 'add-point') {
        return;
      }

      // for creating new polygon
      if (!this.drawingMode || !this.tagMouseDown) return;

      let pointer = this.canvas.getPointer(o.e);

      if (this.selectedTool == 'square') {
        if (this.mouseX > pointer.x) {
          this.currentShape.set({ left: Math.abs(pointer.x) });
        }
        if (this.mouseY > pointer.y) {
          this.currentShape.set({ top: Math.abs(pointer.y) });
        }

        this.currentShape.set({ width: Math.abs(this.mouseX - pointer.x) });
        this.currentShape.set({ height: Math.abs(this.mouseY - pointer.y) });
      }

      if (this.selectedTool == 'circle') {
        this.currentShape.set({ rx: Math.abs(this.mouseX - pointer.x) / 2, ry: Math.abs(this.mouseY - pointer.y) / 2});
      }

      if (this.selectedTool == 'polygon' && this.isCreatingPolygon) {
        if (this.currentPolygonLine && this.currentPolygonLine.class === 'line') {
          const pointer = this.canvas.getPointer(o.e);
          this.currentPolygonLine.set({
            x2: pointer.x,
            y2: pointer.y
          });
          const points = this.currentPolygonShape.get('points');
          points[this.pointsInPolygon.length] = {
            x: pointer.x,
            y: pointer.y,
          };
          this.currentPolygonLine.set({
            points
          });
        }
      }

      this.canvas.renderAll();

    });

    /** ON MOUSE UP */
    this.canvas.on('mouse:up', (e) => {

      if (!this.selectedTool) return;
      if (this.selectedTool == 'pick') {
        // lets check if to highlight the keyframe
        let tId = e.target ? e.target : null;
        this.setSelectedKeyframe(tId);
        return;
      }

      if (this.selectedTool == 'pan') {
        this.canvas.setViewportTransform(this.canvas.viewportTransform);
        this.isDragging = false;
        this.selection = true;
        this.canvas.defaultCursor = 'grab';
        return;
      }

      // lets set the current object
      if (e.target && !this.isCreatingPolygon) {
        this.currentShape = e.target;
        this.currentShapeIndex = this.canvas.getObjects().indexOf(this.currentShape);
      }

      // lets catch the point of mouse incase to add/remove new point
      if (this.selectedTool == 'add-point') {
        let pointer = this.canvas.getPointer(e);
        this.addNewPointToPolygon(pointer, this.currentShape);
        return;
      }


      if (this.selectedTool == 'polygon' && this.isCreatingPolygon) {
        return;
      }

      if (!this.selectedTool || this.isEditingShape) return;

      // lets update all entries to remove highlights
      this.entries.forEach((rec) => {
        rec.is_selected = false;
      });

      let newEntry = this.setPolygonData(this.lastEntryId, this.selectedTool, this.currentShape, true);
      this.entries.push(newEntry);

      // lets push new array
      this.updateEntries.emit(newEntry);
      this.canvas.setActiveObject(this.currentShape);
      this.currentShape = null;
      this.setEditingCanvasMode(false);
    });
  }

  /**
   * This will just construct the data 
   * for the oject
   */
  setPolygonData(id, typeOfPolygon, obj, isNew) {
    if (typeOfPolygon == 'circle') {
      return {
        id: id,
        is_new: isNew,
        data: {
          shape_type: typeOfPolygon,
          left: obj.left,
          rx: obj.rx,
          ry: obj.ry,
          top: obj.top,
          polygon_points: '-',
        },
        is_selected: false,
        is_blur: false,
        edit_this: false,
        frame_index: this.lastEntryId - 1
      };
    }

    if (typeOfPolygon == 'square') {
      return {
        id: id,
        is_new: isNew,
        data: {
          shape_type: typeOfPolygon,
          left: obj.left,
          top: obj.top,
          polygon_points: '4',
          height: obj.height,
          width: obj.width,
        },
        is_selected: false,
        is_blur: false,
        edit_this: false,
        frame_index: this.lastEntryId - 1
      };
    }

    if (typeOfPolygon == 'polygon') {
      return {
        id: id,
        is_new: isNew,
        data: {
          shape_type: typeOfPolygon,
          left: obj.left,
          radius: obj.radius,
          top: obj.top,
          polygon_points: obj.points.length,
          height: obj.height,
          width: obj.width,
          points: obj.points,
        },
        is_selected: false,
        is_blur: false,
        edit_this: false,
        frame_index: this.lastEntryId - 1
      };
    }
  }

  /**
   * this will redraw depening
   * on the entries
   */
  redrawAllObject(entries) {
    let poly;

    entries.forEach(rec => {

      if (rec.data.shape_type == 'square') {
        poly = new fabric.Rect({
          left: rec.data.left,
          top: rec.data.top,
          originX: 'left',
          originY: 'top',
          width: rec.data.width,
          height: rec.data.height,
          fill: '',
          stroke: this.defaultLineColor,
          strokeWidth: this.defaultStrokeWidth,
          transparentCorners: false,
          id: this.id_prefix + rec.id
        });
      }

      if (rec.data.shape_type == 'circle') {
        poly = new fabric.Ellipse({
          left: rec.data.left,
          top: rec.data.top,
          fill: '',
          stroke: this.defaultLineColor,
          strokeWidth: this.defaultStrokeWidth,
          transparentCorners: false,
          originX: 'left', originY: 'top',
          rx: rec.data.rx, ry: rec.data.ry,
          id: this.id_prefix + rec.id
        });
      }

      if (rec.data.shape_type == 'polygon') {
        poly = new fabric.Polygon(rec.data.points, {
          top: rec.data.top,
          left: rec.data.left,
          stroke: this.defaultLineColor,
          strokeWidth: this.defaultStrokeWidth,
          fill: '',
          objectCaching: false,
          moveable: false,
          id: this.id_prefix + rec.id
        });
      }
      this.canvas.add(poly);
    });

    this.canvas.renderAll();
  }


  /**
   * just increment the id
   */
  generateObjectId() {
    return this.lastEntryId += 1;
  }

  /**
   * just set the attribute to selected
   * for internal call on mouse click
   */
  setSelectedKeyframe(objectId) {
    let hasObjectSelected = false;
    let arStr = objectId == null ? 'none' : objectId.id.split('_');
    this.entries.forEach((rec) => {
      rec.is_selected = false;

      if (rec.id == arStr[1]) {
        rec.is_selected = true;
        hasObjectSelected = true;
      }
    });

    this.isFocusingObject.emit(hasObjectSelected);

  }
  /**
   * Jusst focus to polygon triggered
   * from outside componetn calls
   */
  hightLightPolygon(objId: string) {
    // all id created in this component
    // are prefix so we need to check if prefix is preset
    let rawId = objId + '';
    if (!rawId.includes(this.id_prefix))
      objId = this.id_prefix + objId;

    this.canvas.getObjects().forEach(obj => {
      if (obj.id == objId) {
        this.canvas.setActiveObject(obj).renderAll();
        this.currentShape = obj;
        return;
      }
    });
  }

  /**
   * Just hide other object except
   * the seelcted
   */
  hideOtherObjectsExcept(objId: string) {
    // all id created in this component
    // are prefix so we need to check if prefix is preset
    let rawId = objId + '';
    if (!rawId.includes(this.id_prefix))
      objId = this.id_prefix + objId;

    this.canvas.getObjects().forEach(obj => {
      if (obj.id != objId) {
        this.canvas.remove(obj);
      }
    });

    this.canvas.renderAll();
  }

  /**
   * this will disable editing canvas
   */
  setEditingCanvasMode(enableDrawing: boolean = false) {
    if (!enableDrawing) {
      this.canvas.getObjects().forEach(obj => {
        obj.lockMovementX = true;
        obj.lockMovementY = true;
        obj.setControlsVisibility({
          mt: false,
          mb: false,
          ml: false,
          mr: false,
          bl: false,
          br: false,
          tl: false,
          tr: false,
          mtr: false,
        });

      });
      this.canvas.renderAll();
      this.isEditingShape = false;
      this.drawingMode = false;
      this.selectedTool = 'pick';
      this.tagMouseDown = false;
      this.drawingMode = false;
      this.canvas.defaultCursor = 'default';

      // lets make sure all entries is not blur
      if ( this.entries) {
        this.entries.forEach((rec, i) => {
          this.entries[i].is_blur = false;
        });
      }
    }
  }


  /** 
   * This hnaldes the event of object 
  */
  initCanvasObjectEvent() {
    this.canvas.on('after:render', (o: any) => {
     
    });

    this.canvas.on('object:selected', (o: any) => {

    });
  }

  /** 
   * This will draw square in canvas 
   */
  createSquare(pointer: any) {
    this.mouseX = pointer.x;
    this.mouseY = pointer.y;
    this.currentShape = new fabric.Rect({
      left: this.mouseX,
      top: this.mouseY,
      originX: 'left',
      originY: 'top',
      width: pointer.x - this.mouseX,
      height: pointer.y - this.mouseY,
      fill: '',
      stroke: this.defaultLineColor,
      strokeWidth: this.defaultStrokeWidth,
      transparentCorners: false,
      id: this.id_prefix + this.generateObjectId()
    });
  }

  /**
   * remove polygon in canvas
   */
  deleteObject(index) {
    this.canvas.getObjects().forEach(obj => {
      if (this.id_prefix + index == obj.id) {
        this.canvas.remove(obj);
        return;
      }
    });

  }

  /**
   * this will show all polygons
   */
  renderAllCreatedPolygons() {
    // lets remove all, we use this instead of clear so that we dont render the image
    this.canvas.getObjects().forEach(obj => {
      this.canvas.remove(obj);
    })

    this.redrawAllObject(this.entries);
  }

  /** 
   * this will draw circle in canvas 
   */
  createCircle(pointer: any) {
    this.mouseX = pointer.x;
    this.mouseY = pointer.y;

    this.currentShape = new fabric.Ellipse({
      left: this.mouseX,
      top: this.mouseY,
      fill: '',
      stroke: this.defaultLineColor,
      strokeWidth: this.defaultStrokeWidth,
      transparentCorners: false,
      originX: 'left', originY: 'top',
      rx: 5, ry: 1,
      id: this.id_prefix + this.generateObjectId()
    });
  }

  /**
   * this will create polygon in canvase
   */
  createPolygon(p) {
    const points = [];
    // collect points and remove them from canvas
    for (const point of this.pointsInPolygon) {
      points.push({
        x: point.left,
        y: point.top,
      });
      this.canvas.remove(point);
    }

    // remove lines from canvas
    for (const line of this.linesInPolygon) {
      this.canvas.remove(line);
    }

    // remove selected Shape and Line 
    this.canvas.remove(this.currentShape).remove(this.currentPolygonLine);

    // create polygon from collected points
    this.currentShape = new fabric.Polygon(points, {
      stroke: this.defaultLineColor,
      strokeWidth: this.defaultStrokeWidth,
      fill: '',
      objectCaching: false,
      moveable: false,
      id: this.id_prefix + this.generateObjectId()
    });

    this.canvas.remove(this.currentPolygonShape);
    // lets reset
    this.currentPolygonLine = null;
    this.currentPolygonShape = null;
    this.linesInPolygon = [];
    this.pointsInPolygon = [];
    this.isCreatingPolygon = false;

  }


  /** function to zoom in */
  zoomIn() {
    this.canvasScale = 1.25;
    this.canvas.zoomToPoint(new fabric.Point(this.canvas.width / 2, this.canvas.height / 2), this.canvas.getZoom() * this.canvasScale);
  }

  zoomOut() {
    this.canvasScale = 1.25;
    this.canvas.zoomToPoint(new fabric.Point(this.canvas.width / 2, this.canvas.height / 2), this.canvas.getZoom() / this.canvasScale);
  }

  /**
   * function to create polygon points and line
   * Used for non existing polygon
   */
  addPolygonPoint(options) {
    const pointOption = {
      id: new Date().getTime(),
      radius: 5,
      fill: this.defaultLineColor,
      stroke: this.defaultLineColor,
      strokeWidth: this.defaultStrokeWidth,
      left: options.e.layerX / this.canvas.getZoom(),
      top: options.e.layerY / this.canvas.getZoom(),
      selectable: false,
      hasBorders: false,
      hasControls: false,
      originX: 'center',
      originY: 'center',
      objectCaching: false,
    };
    const point = new fabric.Circle(pointOption);
    if (this.pointsInPolygon.length === 0) {
      // fill first point with red color
      point.set({
        fill: '#fff'
      });
    }
    const linePoints = [
      options.e.layerX / this.canvas.getZoom(),
      options.e.layerY / this.canvas.getZoom(),
      options.e.layerX / this.canvas.getZoom(),
      options.e.layerY / this.canvas.getZoom(),
    ];
    const lineOption = {
      strokeWidth: 2,
      fill: '',
      stroke: this.defaultLineColor,
      originX: 'center',
      originY: 'center',
      selectable: false,
      hasBorders: false,
      hasControls: false,
      evented: false,
      objectCaching: false,
    };
    const line = new fabric.Line(linePoints, lineOption);
    line.class = 'line';

    if (this.currentPolygonShape) {
      const pos = this.canvas.getPointer(options.e);
      const points = this.currentPolygonShape.get('points');
      points.push({
        x: pos.x,
        y: pos.y
      });

      const polygon = new fabric.Polygon(points, {
        stroke: this.defaultLineColor,
        strokeWidth: this.defaultStrokeWidth,
        fill: '',
        opacity: 0.3,
        selectable: false,
        hasBorders: false,
        hasControls: false,
        evented: false,
        objectCaching: false,
      });
      this.canvas.remove(this.currentPolygonShape);
      this.canvas.add(polygon);
      this.currentPolygonShape = polygon;
      this.canvas.renderAll();
    } else {
      const polyPoint = [{
        x: options.e.layerX / this.canvas.getZoom(),
        y: options.e.layerY / this.canvas.getZoom(),
      },];
      const polygon = new fabric.Polygon(polyPoint, {
        stroke: this.defaultLineColor,
        strokeWidth: this.defaultStrokeWidth,
        fill: '',
        opacity: 0.3,
        selectable: false,
        hasBorders: false,
        hasControls: false,
        evented: false,
        objectCaching: false,
      });
      this.currentPolygonShape = polygon;
      this.canvas.add(polygon);
    }

    this.currentPolygonLine = line;
    this.pointsInPolygon.push(point);
    this.linesInPolygon.push(line);

    this.canvas.add(line);
    this.canvas.add(point);
  }

  /**
   * this function handles add/remove points
   * and moving points
   */
  editCurrentShape() {

    if (!this.currentShape)
      return;

    let kf = this.getKeyframeDataFromIndex(this.currentShape.id);
    if (kf.data.shape_type != 'polygon') {
      // the only editable for not custom polygon is size and movement
      this.currentShape.lockMovementX = false;
      this.currentShape.lockMovementY = false;
      this.currentShape.setControlsVisibility({
        mt: true,
        mb: true,
        ml: true,
        mr: true,
        bl: true,
        br: true,
        tl: true,
        tr: true,
        mtr: true,
      });
      this.currentShape.hasControls = true;
      this.currentShape.strokeUniform = true;
      this.canvas.setActiveObject(this.currentShape);
      return;
    }
    
    // =============================================
    // if it goes here means you are editing polygon
    // =============================================

    this.isEditingShape = true;
    let poly = this.currentShape;
    poly.hasControls = true;

    this.canvas.setActiveObject(poly);
    poly.edit = !poly.edit;
    if (!poly.edit) {
      poly.controls = fabric.Object.prototype.controls;
      poly.hasControls = false;
      this.isEditingShape = false;

    } else {
      // lets draw cirlces on the points
      let lastControl = poly.points.length - 1;
      poly.cornerStyle = 'circle';
      poly.cornerColor = this.defaultLineColor;
      poly.controls = poly.points.reduce(function (acc, point, index) {
        acc['p' + index] = new fabric.Control({
          positionHandler: polygonPositionHandler,
          actionHandler: anchorWrapper(index > 0 ? index - 1 : lastControl, actionHandler),
          actionName: 'modifyPolygon',
          pointIndex: index
        });
        return acc;
      }, {});
    }
    poly.hasBorders = !poly.edit;
    this.canvas.requestRenderAll();

    /**
     * Inner function of edit to define the polygon in the same position
     */
    function anchorWrapper(anchorIndex, fn) {
      return function (eventData, transform, x, y) {
        var fabricObject = transform.target,
          absolutePoint = fabric.util.transformPoint({
            x: (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x),
            y: (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y),
          }, fabricObject.calcTransformMatrix()),
          actionPerformed = fn(eventData, transform, x, y),
          newDim = fabricObject._setPositionDimensions({}),
          polygonBaseSize = fabricObject._getNonTransformedDimensions(),
          newX = (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x) / polygonBaseSize.x,
          newY = (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y) / polygonBaseSize.y;
        fabricObject.setPositionByOrigin(absolutePoint, newX + 0.5, newY + 0.5);
        return actionPerformed;
      }
    }

    /**
     * Inner function to locate the controls
     * used for drawing and interaction
     */
    function polygonPositionHandler(dim, finalMatrix, fabricObject) {
      var x = (fabricObject.points[this.pointIndex].x - fabricObject.pathOffset.x),
        y = (fabricObject.points[this.pointIndex].y - fabricObject.pathOffset.y);
      return fabric.util.transformPoint(
        { x: x, y: y },
        fabric.util.multiplyTransformMatrices(
          fabricObject.canvas.viewportTransform,
          fabricObject.calcTransformMatrix()
        )
      );
    }

    /**
     * Inner function that will define what the control needs to do
     * all mouse event interaction is define here
     */
    function actionHandler(eventData, transform, x, y) {
      let polygon = transform.target;
      let currentControl = polygon.controls[polygon.__corner];
      let mouseLocalPosition = polygon.toLocalPoint(new fabric.Point(x, y), 'center', 'center');
      let polygonBaseSize = polygon._getNonTransformedDimensions();
      let size = polygon._getTransformedDimensions(0, 0);
      let finalPointPosition = {
        x: mouseLocalPosition.x * polygonBaseSize.x / size.x + polygon.pathOffset.x,
        y: mouseLocalPosition.y * polygonBaseSize.y / size.y + polygon.pathOffset.y
      };
      polygon.points[currentControl.pointIndex] = finalPointPosition;
      return true;
    }
  }

  /** 
   * set canvas size 
   */
  setCanvasSize(dimension: any) {
    this.canvas.setWidth(dimension.width);
    this.canvas.setHeight(dimension.height);
  }

  /** 
   * this will just set eh canva image 
   */
  scaleImageToCanvas() {

    let canvasAspect = this.canvasWidth / this.canvasHeight;
    let imgAspect = this.currentImage.width / this.currentImage.height;
    let scaleFactor;

    if (canvasAspect <= imgAspect) {
      scaleFactor = this.canvasWidth / this.currentImage.width;
      this.canvas.setHeight(this.currentImage.height * scaleFactor);
    } else {
      scaleFactor = this.canvasHeight / this.currentImage.height;
      this.canvas.setWidth(this.currentImage.width * scaleFactor);
    }
    this.canvasHeight = this.canvas.getHeight();
    this.canvasWidth = this.canvas.getWidth();

    let center = this.canvas.getCenter();
    this.canvas.setBackgroundImage(this.currentImage, this.canvas.renderAll.bind(this.canvas), {
      top: center.top,
      left: center.left,
      originX: 'center',
      originY: 'center',
      scaleX: scaleFactor,
      scaleY: scaleFactor
    });

    // lets render it here after the image is loaded in the canvas
    this.renderPolygonFromKeyframes(this.entries);
    this.setEditingCanvasMode(false);
    this.canvas.renderAll();
  }

  /**
   * This will add count label on upper left of the polygon
   */
  renderIndexLabel(labelIndex, labelColor) {
    return function renderIndexLabel(ctx, left, top, styleOverride, fabricObject) {
      ctx.save();
      ctx.translate(left, top);
      ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
      ctx.font = "20px Helvetica";
      ctx.fillStyle = labelColor;
      let width = ctx.measureText(labelIndex).width + 8;
      ctx.fillRect(-5, -15, width, parseInt(ctx.font, 12));
      ctx.fillStyle = '#fff';
      ctx.fillText(labelIndex, -2, 3);
      ctx.restore();
    }
  }



  /**
   * This will add new point in the polygon
   * this is used for existing polygon 
   * which is in edit mode
   */
  addNewPointToPolygon(pointer, curPolygon) {
    let points = curPolygon.points;
    let pos = getRealPoint(pointer, curPolygon);

    // lets get the nearest point
    let nearestPoint = this.getClosestCoordinates(pos, points);

    points.splice(nearestPoint.index, 0, pos);

    curPolygon.points = points;

    this.selectedTool = '';
    // lets refresh the current shape after edits
    this.currentShape = this.canvas.getObjects()[this.currentShapeIndex];
    this.canvas.renderAll();

    /**
     * Internal function for getign real point
     */
    function getRealPoint(pointer, curPolygon) {
      let mouseLocalPosition = curPolygon.toLocalPoint(new fabric.Point(pointer.x, pointer.y), 'center', 'center');
      let polygonBaseSize = curPolygon._getNonTransformedDimensions();
      let size = curPolygon._getTransformedDimensions(0, 0);
      let finalPointPosition = {
        x: mouseLocalPosition.x * polygonBaseSize.x / size.x + curPolygon.pathOffset.x,
        y: mouseLocalPosition.y * polygonBaseSize.y / size.y + curPolygon.pathOffset.y
      };

      return finalPointPosition;
    }
  }


  /**
   * lets get the closest coordinate
   */
  getClosestCoordinates(pointer, pointerCollection) {
    var minLength = 10000000;
    var minObj = null;
    for (let i = 0; i < pointerCollection.length; i++) {
      if (Math.pow(pointerCollection[i].x - pointer.x, 2) + Math.pow(pointerCollection[i].y - pointer.y, 2) < minLength) {
        minObj = pointerCollection[i];
        minLength = Math.pow(pointerCollection[i].y - pointer.y, 2) + Math.pow(pointerCollection[i].y - pointer.y, 2);
      }
    }

    for (let i = 0; i < pointerCollection.length; i++) {
      if (pointerCollection[i].x == minObj.x && pointerCollection[i].y == minObj.y) {
        return { coord: pointerCollection[i], index: i };
      }
    }
  }

  /** this will remove all canvas object except background */
  clearCanvasObjects() {
    // lets clear canvas before drawing
    let canvasObjects = this.canvas.getObjects();
    canvasObjects.forEach(obj => {
      this.canvas.remove(obj);
    });
  }

  /** 
   * Draw polygon coming from the iframes
   * provided
   */
  renderPolygonFromKeyframes(frames) {
    // loop thru all keyframe
    if (frames) {
      frames.forEach((obj, i) => {
        if (obj.polygon == null) {
          // since it was reconstructed to follow the new format
          this.legacyUviewData(obj.data, obj.id);
        } else {
          // lets render the poloygon from here`
          this.redrawAllObject([obj]);
        }

      });
    }
    this.canvas.renderAll();
  }

  /**
   * Render the polygon base on the
   * legacy uview data percentage
   */
  legacyUviewData(obj, id) {
    let top = this.toPixelPoint(obj.top, this.canvasHeight),
      left = this.toPixelPoint(obj.left, this.canvasWidth),
      width = this.toPixelPoint(obj.width, this.canvasWidth),
      height = this.toPixelPoint(obj.height, this.canvasHeight);

    let polygon = new fabric.Rect({
      left: left,
      top: top,
      width: width,
      height: height,
      fill: '',
      stroke: this.defaultLineColor,
      strokeWidth: this.defaultStrokeWidth,
      transparentCorners: false,
      id: this.id_prefix + id
    });

    this.canvas.add(polygon);
  }


  /**
   * Just to get the kframe data
   * and not the object
   */
  getKeyframeDataFromIndex(kfId) {
    let selected: any = null;
    this.entries.forEach(kframe => {
      if (this.id_prefix + kframe.id == kfId) {
        selected = kframe;
      }
    });
    return selected;
  }


  /**
   * =====================================================
   * ========== FOR PERCENT TO POINT START HERE ==========
   * =====================================================
   */
  toPixelPoint(value, dimension) {
    return value * dimension;
  }

  toPointPercent(value, dimension) {
    return value / dimension;
  }

  objectToPercent(polygonData) {
    if (polygonData.shape_type == 'square') {
      polygonData.top = this.toPointPercent(polygonData.top, this.canvasHeight);
      polygonData.left = this.toPointPercent(polygonData.left, this.canvasWidth);
      polygonData.width = this.toPointPercent(polygonData.width, this.canvasWidth);
      polygonData.height = this.toPointPercent(polygonData.height, this.canvasHeight);
      return polygonData;
    }

    if (polygonData.shape_type == 'circle') {
      polygonData.top = this.toPointPercent(polygonData.top, this.canvasHeight);
      polygonData.left = this.toPointPercent(polygonData.left, this.canvasWidth);
      polygonData.rx = this.toPointPercent(polygonData.rx, this.canvasWidth);
      polygonData.ry = this.toPointPercent(polygonData.ry, this.canvasHeight);
      return polygonData;
    }

    if (polygonData.shape_type == 'polygon') {
      polygonData.points.forEach((element, i) => {
        polygonData.points[i] = {
          x: this.toPointPercent(element.x, this.canvasWidth),
          y: this.toPointPercent(element.y, this.canvasHeight)
        }
      });
      polygonData.top = this.toPointPercent(polygonData.top, this.canvasHeight);
      polygonData.left = this.toPointPercent(polygonData.left, this.canvasWidth);
      polygonData.width = this.toPointPercent(polygonData.width, this.canvasWidth);
      polygonData.height = this.toPointPercent(polygonData.height, this.canvasHeight);
      polygonData.radius = this.toPointPercent(polygonData.radius, this.canvasWidth);
      return polygonData;
    }
  }
  objectToPixel(polygonData) {
    if (polygonData.shape_type == 'square') {
      polygonData.top = this.toPixelPoint(polygonData.top, this.canvasHeight);
      polygonData.left = this.toPixelPoint(polygonData.left, this.canvasWidth);
      polygonData.width = this.toPixelPoint(polygonData.width, this.canvasWidth);
      polygonData.height = this.toPixelPoint(polygonData.height, this.canvasHeight);
      return polygonData;
    }

    if (polygonData.shape_type == 'circle') {
      polygonData.top = this.toPixelPoint(polygonData.top, this.canvasHeight);
      polygonData.left = this.toPixelPoint(polygonData.left, this.canvasWidth);
      polygonData.rx = this.toPixelPoint(polygonData.rx, this.canvasWidth);
      polygonData.ry = this.toPixelPoint(polygonData.ry, this.canvasHeight);
      return polygonData;
    }

    if (polygonData.shape_type == 'polygon') {
      polygonData.points.forEach((element, i) => {
        polygonData.points[i] = {
          x: this.toPixelPoint(element.x, this.canvasWidth),
          y: this.toPixelPoint(element.y, this.canvasHeight)
        }
      });
      polygonData.top = this.toPixelPoint(polygonData.top, this.canvasHeight);
      polygonData.left = this.toPixelPoint(polygonData.left, this.canvasWidth);
      polygonData.width = this.toPixelPoint(polygonData.width, this.canvasWidth);
      polygonData.height = this.toPixelPoint(polygonData.height, this.canvasHeight);
      polygonData.radius = this.toPixelPoint(polygonData.radius, this.canvasWidth);
      return polygonData;
    }
    /**
     * =====================================================
     * ========== FOR PERCENT TO POINT END HERE ==========
     * =====================================================
     */
  }
}
