class object {
    constructor(name, type = name) {
        this.svgElement = document.createElementNS("http://www.w3.org/2000/svg", name);
        currentLayer.group.appendChild(this.svgElement);
        this.svgElement.obj = this;
        this.type = type;
        this.isCompleted = false;
        this.isSelected = false;
        this.isMoving = false;
        this.arePointsAndFrameShown = true;
        this.x0 = curX;
        this.y0 = curY;
        this.pointsArray = [];
        this.frameArray = [];
        this.strokeWidth = 1;
        updateFill(this);
        updateStroke(this);
        this.addActions();
    }
    createClone(clone) {
        clone.type = this.type;
        clone.isCompleted = true;
        clone.isSelected = true;
        clone.isMoving = false;
        clone.x0 = this.x0;
        clone.y0 = this.y0;
        clone.strokeWidth = this.strokeWidth;
        clone.removeFrameAndPoints();
        for (let i = 0; i < this.pointsArray.length; i++) {
            clone.pointsArray[i] = this.pointsArray[i].createClone(clone);
        }
        for (let i = 0; i < this.frameArray.length; i++) {
            clone.frameArray[i] = this.frameArray[i].createClone(clone);
        }
        clone.svgElement.setAttribute('fill', this.svgElement.getAttribute('fill'));
        clone.svgElement.setAttribute('fill-opacity', this.svgElement.getAttribute('fill-opacity'));
        clone.svgElement.setAttribute('opacity', this.svgElement.getAttribute('opacity'));
        clone.svgElement.setAttribute('stroke', this.svgElement.getAttribute('stroke'));
        clone.svgElement.setAttribute('stroke-width', this.strokeWidth);
        clone.svgElement.setAttribute('stroke-dasharray', this.svgElement.getAttribute('stroke-dasharray'));
        clone.svgElement.setAttribute('stroke-linejoin', this.svgElement.getAttribute('stroke-linejoin'));
        clone.svgElement.setAttribute('stroke-linecap', this.svgElement.getAttribute('stroke-linecap'));
        clone.removeHotKeys();
        clone.arePointsAndFrameShown = true;
        clone.hide();
    }
    addActions() {
        //select
        const select = (() => {
            if (wasPressed == "cursor") {
                resetCurrentObject()

                if (this.isCompleted) {
                    this.showFrameAndPoints();
                    currentObject = this;
                    this.addPanel();
                }
            }

            if (wasPressed == "fill" && this.type != 'pencil') {
                updateFill(this, 2);
            }

            if (wasPressed == "eraser") {
                doFunc("delete", this);
                this.hide();
            }
        }).bind(this);
        this.svgElement.addEventListener("mousedown", select);
        this.svgElement.addEventListener("mouseout", function () {
            isSomeObjectSelected = false;
        });
        this.svgElement.addEventListener("mouseover", function () {
            if (wasPressed == "cursor") {
                isSomeObjectSelected = true;
            }
        });
        //hide
        svgPanel.addEventListener("mousedown", function () {
            if (!isSomeObjectSelected && !isSomePointSelected && wasPressed != "scale") {
                resetCurrentObject();
            }
        });
        //move
        const move = ((current) => {
            if (this.isCompleted && this.isSelected && this.isMoving) {
                updateCursorCoords(current);
                this.move();
            }
        }).bind(this);
        document.addEventListener("mousemove", move);
        const startMoving = ((current) => {
            if (wasPressed == "cursor" && this.isCompleted && this.isSelected && this.type != 'text') {
                this.isMoving = true;
                updateCursorCoords(current);
                this.start = {
                    x: curX,
                    y: curY
                };
                doFunc("move", this, this.getCornerCoords())
            }
        }).bind(this);
        this.svgElement.addEventListener("mousedown", startMoving);
        const stopMoving = ((current) => {
            if (this.isSelected && this.isMoving) {
                this.isMoving = false;
                updateCursorCoords(current);
                currentPointTypeAttr = null;
                this.stopMoving();
                this.updateParameters();
            }
        }).bind(this);
        svgPanel.addEventListener("mouseup", stopMoving);
        this.svgElement.addEventListener("mouseover", () => {
            if (isEraserActive) {
                doFunc("delete", this);
                this.hide();
            }
        });
    }
    showSvgElement() {
        currentLayer.group.appendChild(this.svgElement);
    }
    setElementAttribute(attributeName, value) {
        this.svgElement.setAttribute(attributeName, value);
    }
    getElementAttribute(attributeName) {
        return this.svgElement.getAttribute(attributeName);
    }
    remove() {
        resetCurrentObject();
        currentLayer.group.removeChild(this.svgElement);
        this.svgElement = null;
        this.isSelected = false;
        this.isMoving = false;
        this.removeFrameAndPoints();
    }
    removeFrameAndPoints() {
        for (let i = 0; i < this.pointsArray.length; i++) {
            this.pointsArray[i].remove();
        }
        for (let i = 0; i < this.frameArray.length; i++) {
            this.frameArray[i].remove();
        }
        this.pointsArray = [];
        this.frameArray = [];
    }
    hide() {
        this.hideFrameAndPoints()
        currentLayer.group.removeChild(this.svgElement);
        this.removePanel();
    }
    show() {
        currentLayer.group.appendChild(this.svgElement);
        this.showFrameAndPoints();
    }
    hideFrameAndPoints() {
        if (this.arePointsAndFrameShown) {
            for (let i = 0; i < this.frameArray.length; i++) {
                this.frameArray[i].hide();
            }
            for (let i = 0; i < this.pointsArray.length; i++) {
                this.pointsArray[i].hide();
            }
        }
        this.arePointsAndFrameShown = false;
        this.isSelected = false;
    }
    showFrameAndPoints() {
        if (!this.arePointsAndFrameShown) {
            for (let i = 0; i < this.frameArray.length; i++) {
                this.frameArray[i].show();
            }
            for (let i = 0; i < this.pointsArray.length; i++) {
                this.pointsArray[i].show();
            }
        }
        this.arePointsAndFrameShown = true;
        this.isSelected = true;
    }
    appendSvgElement() {
        currentLayer.group.append(this.svgElement);
    }
    prependSvgElement() {
        currentLayer.group.prepend(this.svgElement);
    }
    addPanel() {
        obj_panel.style.display = "flex";
        for (i = 0; i < 3; i++) {
            unblockEditing(i);
        }
        this.addParameters();
        this.updateParameters();
    }
    removePanel() {
        obj_panel.style.display = "none";
        for (i = 0; i < 3; i++) {
            blockEditing(i);
        }
        this.removeParameters();
    }
    updateFrameAndPoints() {}
    addHotKeys() {}
    removeHotKeys() {}
    create() {}
    //PROPERTIES PANEL
    addParameters() {}
    updateParameters() {}
    removeParameters() {}
    //FILL AND STROKE
    getFillAttrs() {
        return [
            this.getElementAttribute('opacity'),
            this.getElementAttribute('fill-opacity'),
            this.getElementAttribute('fill')
        ]
    }
    setFillAttrs(attrs) {
        this.svgElement.setAttribute('opacity', attrs[0]);
        this.svgElement.setAttribute('fill-opacity', attrs[1]);
        this.svgElement.setAttribute('fill', attrs[2]);
    }
    getStrokeAttrs() {
        return [
            this.getElementAttribute('stroke-width'),
            this.getElementAttribute('stroke-linecap'),
            this.getElementAttribute('stroke-dasharray'),
            this.getElementAttribute('stroke-linejoin'),
            this.getElementAttribute('stroke'),
        ]
    }
    setStrokeAttrs(attrs) {
        this.svgElement.setAttribute('stroke-width', attrs[0]);
        this.svgElement.setAttribute('stroke-linecap', attrs[1]);
        this.svgElement.setAttribute('stroke-dasharray', attrs[2]);
        this.svgElement.setAttribute('stroke-linejoin', attrs[3]);
        this.svgElement.setAttribute('stroke', attrs[4]);
    }
    //MOVE
    move() {}
    stopMoving() {}
    moveTo() {}
    getCornerCoords() {}
    //RESIZE
    startResize() {}
    resize() {}
    stopResize() {}
    getResizeAttrs() {}
    setResizeAttrs() {}
    //ROTATE
    startRotating() {}
    rotate() {}
    rotateTo() {}
    stopRotating() {}
    getNewCoords() {} //преобразование координат ключевых точек при повороте фигуры
    complete(isSizeNotZero = this.svgElement.getBoundingClientRect().width * this.svgElement.getBoundingClientRect().height > 0) {
        this.updateFrameAndPoints();
        this.removeHotKeys();
        document.onmousemove = null;
        document.onmouseup = null;
        document.onmousedown = null;
        document.onclick = null;

        if (isSizeNotZero) {
            isSomeObjectSelected = false;
            resetCurrentObject();
            this.addPanel();
            currentObject = this;
            cursor.dispatchEvent(new Event("mousedown"));
            cursor.click();
            this.isSelected = true;
            doFunc("create", this);
        } else {
            this.remove();
        }

        this.isCompleted = true;
    }
}

//RECTANGLE
class rectangle extends object {
    constructor() {
        super('rect');
        this.x = curX;
        this.y = curY;
        this.width = 0;
        this.height = 0;
        this.r = 0;
        this.cPoint = {
            x: curX,
            y: curY
        };
        this.frameArray = [new rectangleFrame(this.x, this.y, this.width, this.height, this)];
        this.pointsArray = [new point(this.x, this.y, this, {
                action: "resize",
                attr: "ltc"
            }),
            new point(this.x + this.width / 2, this.y, this, {
                action: "resize",
                attr: "t"
            }),
            new point(this.x + this.width, this.y, this, {
                action: "resize",
                attr: "rtc"
            }),
            new point(this.x + this.width, this.y + this.height / 2, this, {
                action: "resize",
                attr: "r"
            }),
            new point(this.x + this.width, this.y + this.height, this, {
                action: "resize",
                attr: "rbc"
            }),
            new point(this.x + this.width / 2, this.y + this.height, this, {
                action: "resize",
                attr: "b"
            }),
            new point(this.x, this.y + this.height, this, {
                action: "resize",
                attr: "lbc"
            }),
            new point(this.x, this.y + this.height / 2, this, {
                action: "resize",
                attr: "l"
            }),
            new point(this.x + this.width / 2, this.y - 20, this, {
                action: "rotate",
                attr: "rotate"
            })
        ];
        //rotate
        this.transform = 'rotate(' + 0 + ' ' + this.cPoint.x + ' ' + this.cPoint.y + ')';
        this.angle = 0;
    }
    createClone() {
        let clone = new rectangle();
        super.createClone(clone);
        clone.transform = this.transform;
        clone.width = this.width;
        clone.height = this.height;
        clone.x = this.x;
        clone.y = this.y;
        clone.cPoint = this.cPoint;
        clone.angle = this.angle;
        clone.svgElement.setAttribute('width', this.width);
        clone.svgElement.setAttribute('height', this.height);
        clone.svgElement.setAttribute('x', this.x);
        clone.svgElement.setAttribute('y', this.y);
        clone.svgElement.setAttribute('transform', this.transform);
        return clone;
    }
    addParameters() {
        rect_panel.style.display = "flex";
    }
    updateParameters() {
        rectX.value = this.x;
        rectY.value = this.y;
        rectW.value = this.width;
        rectH.value = this.height;
        rectR.value = this.r;
        angleInput.value = this.angle * 180.0 / Math.PI;
    }
    removeParameters() {
        rect_panel.style.display = "none";
    }
    updateAttributes(current) {
        let w = curX - this.x0;
        let h = curY - this.y0;
        let signW = w > 0 ? 1 : -1;
        let signH = h > 0 ? 1 : -1;
        let absW = Math.abs(w);
        let absH = Math.abs(h);
        if (current.shiftKey) {
            absW = Math.min(absW, absH);
            absH = absW;
        }
        this.width = absW;
        this.height = absH;
        this.x = Math.min(this.x0, this.x0 + signW * absW);
        this.y = Math.min(this.y0, this.y0 + signH * absH);
        this.cPoint = {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
        this.svgElement.setAttribute('width', this.width);
        this.svgElement.setAttribute('height', this.height);
        this.svgElement.setAttribute('x', this.x);
        this.svgElement.setAttribute('y', this.y);
        this.updateFrameAndPoints()
    }
    updateFrameAndPoints(width = this.width, height = this.height, x = this.x, y = this.y, transform = this.transform) {
        this.frameArray[0].update(x, y, width, height, transform);

        this.pointsArray[0].update(x, y, transform);
        this.pointsArray[1].update(x + width / 2, y, transform);
        this.pointsArray[2].update(x + width, y, transform);
        this.pointsArray[3].update(x + width, y + height / 2, transform);
        this.pointsArray[4].update(x + width, y + height, transform);
        this.pointsArray[5].update(x + width / 2, y + height, transform);
        this.pointsArray[6].update(x, y + height, transform);
        this.pointsArray[7].update(x, y + height / 2, transform);
        this.pointsArray[8].update(x + width / 2, y - 20, transform);
    }
    //MOVE
    move(dx = curX - this.start.x, dy = curY - this.start.y) {
        let new_dx = getRotateCoords(dx, dy, this.angle).x,
            new_dy = getRotateCoords(dx, dy, this.angle).y;
        this.svgElement.setAttribute('x', this.x + new_dx);
        this.svgElement.setAttribute('y', this.y + new_dy);
        this.updateFrameAndPoints(this.width, this.height, this.x + new_dx, this.y + new_dy, this.transform);
    }
    stopMoving(dx = curX - this.start.x, dy = curY - this.start.y) {
        this.x += dx;
        this.y += dy;
        this.cPoint = {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
        this.transform = 'rotate(' + this.angle * 180.0 / Math.PI + ' ' + this.cPoint.x + ' ' + this.cPoint.y + ')';
        this.svgElement.setAttribute('x', this.x);
        this.svgElement.setAttribute('y', this.y);
        this.svgElement.setAttribute('transform', this.transform);
    }
    moveTo(x, y) {
        let dx = x + pointRadius - this.x,
            dy = y + pointRadius - this.y;
        this.move(dx, dy);
        this.stopMoving(dx, dy);
        this.updateParameters();
    }
    getCornerCoords() {
        return {
            x: this.x - pointRadius,
            y: this.y - pointRadius
        }
    }
    //RESIZE
    startResize() {
        this.resizeTemp = {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
    resize(dx, dy) {
        let new_dx = getRotateCoords(dx, dy, this.angle).x,
            new_dy = getRotateCoords(dx, dy, this.angle).y;
        let n = {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
        switch (currentPointTypeAttr) {
            case "ltc":
                n.x += new_dx;
                n.y += new_dy;
                n.width -= new_dx;
                n.height -= new_dy;
                break;
            case "t":
                n.y += new_dy;
                n.height -= new_dy;
                break;
            case "rtc":
                n.y += new_dy;
                n.width += new_dx;
                n.height -= new_dy;
                break;
            case "r":
                n.width += new_dx;
                break;
            case "rbc":
                n.width += new_dx;
                n.height += new_dy;
                break;
            case "b":
                n.height += new_dy;
                break;
            case "lbc":
                n.x += new_dx;
                n.width -= new_dx;
                n.height += new_dy;
                break;
            case "l":
                n.x += new_dx;
                n.width -= new_dx;
                break;
        }
        if (n.width < 0) {
            if (this.x + this.width < n.x) n.x = this.x + this.width;
            let q = 1;
            switch (currentPointTypeAttr) {
                case "ltc":
                    currentPointTypeAttr = "rtc";
                    break;
                case "lbc":
                    currentPointTypeAttr = "rbc";
                    break;
                case "rtc":
                    q *= -1;
                    currentPointTypeAttr = "ltc";
                    break;
                case "rbc":
                    q *= -1;
                    currentPointTypeAttr = "lbc";
                    break;
                case "l":
                    currentPointTypeAttr = "r";
                    break;
                case "r":
                    q *= -1;
                    currentPointTypeAttr = "l";
                    break;
            }
            pointStart.x += this.width * Math.cos(this.angle) * q;
            pointStart.y += this.width * Math.sin(this.angle) * q;
            n.width = 0;
            this.width = 0;
            this.x = n.x;
        }
        if (n.height < 0) {
            if (this.y + this.height < n.y) n.y = this.y + this.height;
            let q = 1;
            switch (currentPointTypeAttr) {
                case "ltc":
                    currentPointTypeAttr = "lbc";
                    break;
                case "lbc":
                    q *= -1;
                    currentPointTypeAttr = "ltc";
                    break;
                case "rtc":
                    currentPointTypeAttr = "rbc";
                    break;
                case "rbc":
                    q *= -1;
                    currentPointTypeAttr = "rtc";
                    break;
                case "t":
                    currentPointTypeAttr = "b";
                    break;
                case "b":
                    q *= -1;
                    currentPointTypeAttr = "t";
                    break;
            }
            pointStart.x -= this.height * Math.sin(this.angle) * q;
            pointStart.y += this.height * Math.cos(this.angle) * q;
            n.height = 0;
            this.height = 0;
            this.y = n.y;
        }
        this.resizeTemp = n;
        this.svgElement.setAttribute('x', n.x);
        this.svgElement.setAttribute('y', n.y);
        this.svgElement.setAttribute('width', n.width);
        this.svgElement.setAttribute('height', n.height);
        this.setElementAttribute('rx', Math.max(n.height, n.width) * this.r / 100);
        this.updateFrameAndPoints(n.width, n.height, n.x, n.y, this.transform);
    }
    stopResize() {
        this.width = this.resizeTemp.width;
        this.height = this.resizeTemp.height;
        let new_x = this.getNewCoords(this.resizeTemp.x + this.width / 2, this.resizeTemp.y + this.height / 2, this.angle).x,
            new_y = this.getNewCoords(this.resizeTemp.x + this.width / 2, this.resizeTemp.y + this.height / 2, this.angle).y;
        this.cPoint = {
            x: new_x,
            y: new_y
        };
        this.x = this.cPoint.x - this.width / 2;
        this.y = this.cPoint.y - this.height / 2;
        this.transform = 'rotate(' + this.angle * 180.0 / Math.PI + ' ' + this.cPoint.x + ' ' + this.cPoint.y + ')';
        this.svgElement.setAttribute('x', this.x);
        this.svgElement.setAttribute('y', this.y);
        this.svgElement.setAttribute('width', this.width);
        this.svgElement.setAttribute('height', this.height);
        this.svgElement.setAttribute('transform', this.transform);
        this.updateFrameAndPoints();
    }
    getResizeAttrs() {
        return [
            Number(this.getElementAttribute('x')),
            Number(this.getElementAttribute('y')),
            Number(this.getElementAttribute('width')),
            Number(this.getElementAttribute('height')),
            Number(this.getElementAttribute('rx'))
        ]
    }
    setResizeAttrs(attrs) {
        [this.x, this.y, this.width, this.height, this.r] = attrs;
        this.cPoint = {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
        this.transform = 'rotate(' + this.angle * 180.0 / Math.PI + ' ' + this.cPoint.x + ' ' + this.cPoint.y + ')';
        this.svgElement.setAttribute('x', this.x);
        this.svgElement.setAttribute('y', this.y);
        this.svgElement.setAttribute('width', this.width);
        this.svgElement.setAttribute('height', this.height);
        this.svgElement.setAttribute('rx', this.r);
        this.svgElement.setAttribute('transform', this.transform);
        this.setElementAttribute('rx', Math.max(this.height, this.width) * this.r / 100);
        this.updateFrameAndPoints();
        this.updateParameters();
    }
    //ROTATE
    startRotating() {
        this.rPoint = {
            x: this.getNewCoords(this.x + this.width / 2, this.y - 20, this.angle).x,
            y: this.getNewCoords(this.x + this.width / 2, this.y - 20, this.angle).y
        };
    }
    rotate(angle = this.angle) {
        let firstSide = Math.sqrt(Math.pow(Math.abs(this.rPoint.x - this.cPoint.x), 2) + Math.pow(Math.abs(this.rPoint.y - this.cPoint.y), 2)),
            secondSide = Math.sqrt(Math.pow(Math.abs(curX - this.cPoint.x), 2) + Math.pow(Math.abs(curY - this.cPoint.y), 2)),
            thirdSide = (Math.sqrt(Math.pow(Math.abs(curX - this.rPoint.x), 2) + Math.pow(Math.abs(curY - this.rPoint.y), 2))),
            angleCos = (Math.pow(firstSide, 2) + Math.pow(secondSide, 2) - Math.pow(thirdSide, 2)) / (2 * firstSide * secondSide),
            newAngle;
        if (secondSide == 0) newAngle = this.angle;
        else newAngle = getRotateCoords(curX, curY, angle).x >= getRotateCoords(this.cPoint.x, this.cPoint.y, angle).x ?
            Math.acos(angleCos) + angle : 2 * Math.PI - Math.acos(angleCos) + angle;
        this.svgElement.setAttribute('x', this.x);
        this.svgElement.setAttribute('y', this.y);
        this.transform = 'rotate(' + newAngle * 180.0 / Math.PI + ' ' + this.cPoint.x + ' ' + this.cPoint.y + ')';
        this.svgElement.setAttribute('transform', this.transform);
        this.updateFrameAndPoints();
    }
    stopRotating() {
        let argss = this.transform.split('(')[1],
            args = argss.split(')')[0],
            newAngle = args.split(' ')[0] * Math.PI / 180.0;
        this.angle = newAngle;
        this.angle = this.angle > 2 * Math.PI ? this.angle - 2 * Math.PI : this.angle;
        this.updateFrameAndPoints();
    }
    rotateTo(newAngle) {
        this.svgElement.setAttribute('x', this.x);
        this.svgElement.setAttribute('y', this.y);
        this.transform = 'rotate(' + newAngle * 180.0 / Math.PI + ' ' + this.cPoint.x + ' ' + this.cPoint.y + ')';
        this.svgElement.setAttribute('transform', this.transform);
        this.angle = newAngle;
        this.angle = this.angle > 2 * Math.PI ? this.angle - 2 * Math.PI : this.angle;
        this.updateFrameAndPoints();
        this.updateParameters();
    }
    getNewCoords(x = this.x, y = this.y, angle = this.angle) {
        return {
            x: (x - this.cPoint.x) * Math.cos(angle) - (y - this.cPoint.y) * Math.sin(angle) + this.cPoint.x,
            y: (x - this.cPoint.x) * Math.sin(angle) + (y - this.cPoint.y) * Math.cos(angle) + this.cPoint.y
        };
    }
}

//ELLIPSE
class ellipse extends object {
    constructor() {
        super('ellipse');
        this.rx = 0;
        this.ry = 0;
        this.cx = curX;
        this.cy = curY;
        this.frameArray = [new rectangleFrame(this.cx - this.rx, this.cy - this.ry, this.rx * 2, this.ry * 2, this, true),
            new ellipseFrame(this.cx, this.cy, this.rx, this.ry, this)
        ];
        this.pointsArray = [new point(this.cx - this.rx, this.cy - this.ry, this, {
                action: "resize",
                attr: "ltc"
            }),
            new point(this.cx, this.cy - this.ry, this, {
                action: "resize",
                attr: "t"
            }),
            new point(this.cx + this.rx, this.cy - this.ry, this, {
                action: "resize",
                attr: "rtc"
            }),
            new point(this.cx + this.rx, this.cy, this, {
                action: "resize",
                attr: "r"
            }),
            new point(this.cx + this.rx, this.cy + this.ry, this, {
                action: "resize",
                attr: "rbc"
            }),
            new point(this.cx, this.cy + this.ry, this, {
                action: "resize",
                attr: "b"
            }),
            new point(this.cx - this.rx, this.cy + this.ry, this, {
                action: "resize",
                attr: "lbc"
            }),
            new point(this.cx - this.rx, this.cy, this, {
                action: "resize",
                attr: "l"
            }),
            new point(this.cx, this.cy - this.ry - 20, this, {
                action: "rotate",
                attr: "rotate"
            })
        ];
        //rotate
        this.transform = 'rotate(' + 0 + ' ' + this.cx + ' ' + this.cy + ')';
        this.angle = 0;
    }
    createClone() {
        let clone = new ellipse();
        super.createClone(clone);
        clone.transform = this.transform;
        clone.rx = this.rx;
        clone.ry = this.ry;
        clone.cx = this.cx;
        clone.cy = this.cy;
        clone.angle = this.angle;
        clone.svgElement.setAttribute('rx', this.rx);
        clone.svgElement.setAttribute('ry', this.ry);
        clone.svgElement.setAttribute('cx', this.cx);
        clone.svgElement.setAttribute('cy', this.cy);
        clone.svgElement.setAttribute('transform', this.transform);
        return clone;
    }
    addParameters() {
        ell_panel.style.display = "flex";
    }
    updateParameters() {
        ellRX.value = this.rx;
        ellRY.value = this.ry;
        ellCX.value = this.cx;
        ellCY.value = this.cy;
        angleInput.value = this.angle * 180.0 / Math.PI;
    }
    removeParameters() {
        ell_panel.style.display = "none";
    }
    updateAttributes(current) {
        let w = (curX - this.x0) / 2;
        let h = (curY - this.y0) / 2;
        let signW = w > 0 ? 1 : -1;
        let signH = h > 0 ? 1 : -1;
        let absW = Math.abs(w);
        let absH = Math.abs(h);
        if (current.shiftKey) {
            absW = Math.min(absW, absH);
            absH = absW;
        }
        this.rx = absW;
        this.ry = absH;
        this.cx = Math.min(this.x0, this.x0 + 2 * signW * absW) + absW;
        this.cy = Math.min(this.y0, this.y0 + 2 * signH * absH) + absH;
        this.svgElement.setAttribute('rx', this.rx);
        this.svgElement.setAttribute('ry', this.ry);
        this.svgElement.setAttribute('cx', this.cx);
        this.svgElement.setAttribute('cy', this.cy);
        this.updateFrameAndPoints();
    }
    updateFrameAndPoints(rx = this.rx, ry = this.ry, cx = this.cx, cy = this.cy, transform = this.transform) {
        this.frameArray[0].update(cx - rx, cy - ry, rx * 2, ry * 2, transform);
        this.frameArray[1].update(cx, cy, rx, ry, transform);

        this.pointsArray[0].update(cx - rx, cy - ry, transform);
        this.pointsArray[1].update(cx, cy - ry, transform);
        this.pointsArray[2].update(cx + rx, cy - ry, transform);
        this.pointsArray[3].update(cx + rx, cy, transform);
        this.pointsArray[4].update(cx + rx, cy + ry, transform);
        this.pointsArray[5].update(cx, cy + ry, transform);
        this.pointsArray[6].update(cx - rx, cy + ry, transform);
        this.pointsArray[7].update(cx - rx, cy, transform);
        this.pointsArray[8].update(cx, cy - ry - 20, transform);
    }
    //MOVE
    move(dx = curX - this.start.x, dy = curY - this.start.y) {
        let new_dx = getRotateCoords(dx, dy, this.angle).x,
            new_dy = getRotateCoords(dx, dy, this.angle).y;
        this.svgElement.setAttribute('cx', this.cx + new_dx);
        this.svgElement.setAttribute('cy', this.cy + new_dy);
        this.updateFrameAndPoints(this.rx, this.ry, this.cx + new_dx, this.cy + new_dy, this.transform);
    }
    stopMoving(dx = curX - this.start.x, dy = curY - this.start.y) {
        this.cx += dx;
        this.cy += dy;
        this.svgElement.setAttribute('cx', this.cx);
        this.svgElement.setAttribute('cy', this.cy);
        this.transform = 'rotate(' + this.angle * 180.0 / Math.PI + ' ' + this.cx + ' ' + this.cy + ')';
        this.svgElement.setAttribute('transform', this.transform);
    }
    moveTo(x, y) {
        let dx = x + pointRadius - (this.cx - this.rx),
            dy = y + pointRadius - (this.cy - this.ry);
        this.move(dx, dy);
        this.stopMoving(dx, dy);
        this.updateParameters();
    }
    getCornerCoords() {
        return {
            x: (this.cx - this.rx) - pointRadius,
            y: (this.cy - this.ry) - pointRadius
        }
    }
    //RESIZE
    startResize() {
        this.resizeTemp = {
            cx: this.cx,
            cy: this.cy,
            rx: this.rx,
            ry: this.ry
        };
        this.resizeCx = this.cx;
        this.resizeCy = this.cy;
    }
    resize(dx, dy) {
        let new_dx = getRotateCoords(dx, dy, this.angle).x,
            new_dy = getRotateCoords(dx, dy, this.angle).y;
        let n = {
            cx: this.resizeCx,
            cy: this.resizeCy,
            rx: this.rx,
            ry: this.ry
        };
        switch (currentPointTypeAttr) {
            case "ltc":
                n.cx += new_dx / 2;
                n.cy += new_dy / 2;
                n.rx -= new_dx / 2;
                n.ry -= new_dy / 2;
                break;
            case "t":
                n.cy += new_dy / 2;
                n.ry -= new_dy / 2;
                break;
            case "rtc":
                n.cx += new_dx / 2;
                n.cy += new_dy / 2;
                n.rx += new_dx / 2;
                n.ry -= new_dy / 2;
                break;
            case "r":
                n.cx += new_dx / 2;
                n.rx += new_dx / 2;
                break;
            case "rbc":
                n.cx += new_dx / 2;
                n.cy += new_dy / 2;
                n.rx += new_dx / 2;
                n.ry += new_dy / 2;
                break;
            case "b":
                n.cy += new_dy / 2;
                n.ry += new_dy / 2;
                break;
            case "lbc":
                n.cx += new_dx / 2;
                n.cy += new_dy / 2;
                n.rx -= new_dx / 2;
                n.ry += new_dy / 2;
                break;
            case "l":
                n.cx += new_dx / 2;
                n.rx -= new_dx / 2;
                break;
        }
        if (n.rx < 0) {
            if (this.resizeCx + this.rx < n.cx) n.cx = this.resizeCx + this.rx;
            if (this.resizeCx + this.rx > n.cx) n.cx = this.resizeCx - this.rx;
            let q = 1;
            switch (currentPointTypeAttr) {
                case "ltc":
                    currentPointTypeAttr = "rtc";
                    break;
                case "lbc":
                    currentPointTypeAttr = "rbc";
                    break;
                case "rtc":
                    q *= -1;
                    currentPointTypeAttr = "ltc";
                    break;
                case "rbc":
                    q *= -1;
                    currentPointTypeAttr = "lbc";
                    break;
                case "l":
                    currentPointTypeAttr = "r";
                    break;
                case "r":
                    q *= -1;
                    currentPointTypeAttr = "l";
                    break;
            }
            pointStart.x += this.rx * 2 * Math.cos(this.angle) * q;
            pointStart.y += this.rx * 2 * Math.sin(this.angle) * q;
            n.rx = 0;
            this.rx = 0;
            this.resizeCx = n.cx;
        }
        if (n.ry < 0) {
            if (this.resizeCy + this.ry < n.cy) n.cy = this.resizeCy + this.ry;
            if (this.resizeCy + this.ry > n.cy) n.cy = this.resizeCy - this.ry;
            let q = 1;
            switch (currentPointTypeAttr) {
                case "ltc":
                    currentPointTypeAttr = "lbc";
                    break;
                case "lbc":
                    q *= -1;
                    currentPointTypeAttr = "ltc";
                    break;
                case "rtc":
                    currentPointTypeAttr = "rbc";
                    break;
                case "rbc":
                    q *= -1;
                    currentPointTypeAttr = "rtc";
                    break;
                case "t":
                    currentPointTypeAttr = "b";
                    break;
                case "b":
                    q *= -1;
                    currentPointTypeAttr = "t";
                    break;
            }
            pointStart.x -= this.ry * 2 * Math.sin(this.angle) * q;
            pointStart.y += this.ry * 2 * Math.cos(this.angle) * q;
            n.ry = 0;
            this.ry = 0;
            this.resizeCy = n.cy;
        }
        this.resizeTemp = n;
        this.svgElement.setAttribute('cx', n.cx);
        this.svgElement.setAttribute('cy', n.cy);
        this.svgElement.setAttribute('rx', n.rx);
        this.svgElement.setAttribute('ry', n.ry);
        this.updateFrameAndPoints(n.rx, n.ry, n.cx, n.cy, this.transform);
    }
    stopResize() {
        let new_cx = this.getNewCoords(this.resizeTemp.cx, this.resizeTemp.cy, this.angle).x,
            new_cy = this.getNewCoords(this.resizeTemp.cx, this.resizeTemp.cy, this.angle).y;
        this.cx = new_cx;
        this.cy = new_cy;
        this.rx = this.resizeTemp.rx;
        this.ry = this.resizeTemp.ry;
        this.svgElement.setAttribute('cx', this.cx);
        this.svgElement.setAttribute('cy', this.cy);
        this.svgElement.setAttribute('rx', this.rx);
        this.svgElement.setAttribute('ry', this.ry);
        this.transform = 'rotate(' + this.angle * 180.0 / Math.PI + ' ' + this.cx + ' ' + this.cy + ')';
        this.svgElement.setAttribute('transform', this.transform);
        this.updateFrameAndPoints();
    }
    getResizeAttrs() {
        return [
            Number(this.getElementAttribute('cx')),
            Number(this.getElementAttribute('cy')),
            Number(this.getElementAttribute('rx')),
            Number(this.getElementAttribute('ry'))
        ]
    }
    setResizeAttrs(attrs) {
        [this.cx, this.cy, this.rx, this.ry] = attrs;
        this.startResize();
        this.stopResize();
        this.updateParameters();
    }
    //ROTATE
    startRotating() {
        this.rPoint = {
            x: this.getNewCoords(this.cx, this.cy - this.ry - 20, this.angle).x,
            y: this.getNewCoords(this.cx, this.cy - this.ry - 20, this.angle).y
        };
    }
    rotate(angle = this.angle) {
        let firstSide = Math.sqrt(Math.pow(Math.abs(this.rPoint.x - this.cx), 2) + Math.pow(Math.abs(this.rPoint.y - this.cy), 2)),
            secondSide = Math.sqrt(Math.pow(Math.abs(curX - this.cx), 2) + Math.pow(Math.abs(curY - this.cy), 2)),
            thirdSide = (Math.sqrt(Math.pow(Math.abs(curX - this.rPoint.x), 2) + Math.pow(Math.abs(curY - this.rPoint.y), 2))),
            angleCos = (Math.pow(firstSide, 2) + Math.pow(secondSide, 2) - Math.pow(thirdSide, 2)) / (2 * firstSide * secondSide),
            newAngle;
        if (secondSide == 0) newAngle = this.angle;
        else newAngle = getRotateCoords(curX, curY, angle).x >= getRotateCoords(this.cx, this.cy, angle).x ?
            Math.acos(angleCos) + angle : 2 * Math.PI - Math.acos(angleCos) + angle;
        this.svgElement.setAttribute('cx', this.cx);
        this.svgElement.setAttribute('cy', this.cy);
        this.transform = 'rotate(' + newAngle * 180.0 / Math.PI + ' ' + this.cx + ' ' + this.cy + ')';
        this.svgElement.setAttribute('transform', this.transform);
        this.updateFrameAndPoints();
    }
    stopRotating() {
        let argss = this.transform.split('(')[1],
            args = argss.split(')')[0],
            newAngle = args.split(' ')[0] * Math.PI / 180.0;
        this.angle = newAngle;
        this.angle = this.angle > 2 * Math.PI ? this.angle - 2 * Math.PI : this.angle;
        this.updateFrameAndPoints();
    }
    rotateTo(newAngle) {
        this.svgElement.setAttribute('cx', this.cx);
        this.svgElement.setAttribute('cy', this.cy);
        this.transform = 'rotate(' + newAngle * 180.0 / Math.PI + ' ' + this.cx + ' ' + this.cy + ')';
        this.svgElement.setAttribute('transform', this.transform);
        this.angle = newAngle;
        this.angle = this.angle > 2 * Math.PI ? this.angle - 2 * Math.PI : this.angle;
        this.updateFrameAndPoints();
        this.updateParameters();
    }
    getNewCoords(x = this.x0, y = this.y0, angle = this.angle) {
        return {
            x: (x - this.cx) * Math.cos(angle) - (y - this.cy) * Math.sin(angle) + this.cx,
            y: (x - this.cx) * Math.sin(angle) + (y - this.cy) * Math.cos(angle) + this.cy
        };
    }
}

//POLYGON
class polygon extends object {
    constructor() {
        super('polygon');
        this.r = 0;
        this.phi = 0;
        this.vertNum = curVertNum;
        this.vertices = "";
        this.rotationIsFixed = false;
        this.angleIsFixed = false;
        this.radiusIsFixed = false;
        this.fix = this.fix.bind(this);
        this.free = this.free.bind(this);
        this.updateVertNum = this.updateVertNum.bind(this);
        this.addHotKeys();
        this.frameArray = [new polygonFrame(this.vertices, this)];
        for (let i = 0; i < curVertNum; i++) {
            this.pointsArray.push(new point(this.x0, this.y0, this, {
                action: "polygon",
                attr: "polygon"
            }));
        }
    }
    createClone() {
        let clone = new polygon();
        super.createClone(clone);
        clone.r = this.r;
        clone.phi = this.phi;
        clone.vertNum = this.vertNum;
        clone.vertices = this.vertices;
        clone.svgElement.setAttribute('points', this.vertices);
        clone.updateFrameAndPoints();
        return clone;
    }
    addParameters() {
        pol_panel.style.display = "flex";
        polN.min = "3";
    }
    updateParameters() {
        polX.value = this.x0;
        polY.value = this.y0;
        polR.value = this.r;
        polN.value = this.vertNum;
        angleInput.value = this.phi * 180.0 / Math.PI;
    }
    removeParameters() {
        pol_panel.style.display = "none";
    }
    updateAttributes() {
        let dx = curX - this.x0,
            dy = curY - this.y0;
        if (!this.radiusIsFixed) this.r = Math.sqrt(dx ** 2 + dy ** 2);
        else if (dx != 0 && dy != 0) {
            dx *= this.r / Math.sqrt(dx ** 2 + dy ** 2);
            dy *= this.r / Math.sqrt(dx ** 2 + dy ** 2);
        }
        if (!this.angleIsFixed) {
            if (this.rotationIsFixed) this.phi = (this.vertNum - 2) * Math.PI / (this.vertNum * 2);
            else if (this.r > 0) this.phi = dy > 0 ? Math.acos(dx / this.r) : -Math.acos(dx / this.r);
            if (!this.phi) this.phi = (dx / this.r) > 0 ? 0 : Math.PI; //ошибки нет, но теперь дергается
        }
        this.updateFrameAndPoints();
    }
    updateFrameAndPoints(x0 = this.x0, y0 = this.y0) {
        //включает обновление атрибута
        for (let i = 0; i < this.vertNum; i++) {
            let x = x0 + this.r * Math.cos(this.phi + 2 * Math.PI * i / this.vertNum);
            let y = y0 + this.r * Math.sin(this.phi + 2 * Math.PI * i / this.vertNum);
            if (i == 0) {
                this.vertices = x + "," + y;
            } else {
                this.vertices += " " + x + "," + y;
            }
        }
        this.frameArray[0].update(this.vertices);
        for (let i = 0; i < this.vertNum; i++) {
            let x = x0 + this.r * Math.cos(this.phi + 2 * Math.PI * i / this.vertNum);
            let y = y0 + this.r * Math.sin(this.phi + 2 * Math.PI * i / this.vertNum);
            this.pointsArray[i].update(x, y);
            if (currentPointTypeAttr == "polygon") {
                if (i == 0) this.pointsArray[i].setPointAttribute("fill", "red");
                else this.pointsArray[i].setPointAttribute("fill", "white");
            }
        }
        this.svgElement.setAttribute('points', this.vertices);
        this.vertices = "";
    }
    addHotKeys() {
        document.addEventListener('keydown', this.updateVertNum);
        document.addEventListener('keydown', this.fix);
        document.addEventListener('keyup', this.free);
    }
    removeHotKeys() {
        document.removeEventListener('keydown', this.updateVertNum);
        this.rotationIsFixed = false;
        this.angleIsFixed = false;
        this.radiusIsFixed = false;
        document.removeEventListener('keydown', this.fix);
        document.removeEventListener('keyup', this.free);
    }
    updateVertNum(current) {
        if (current.code == 'ArrowUp') {
            curVertNum++;
            this.vertNum++;
        }
        if (current.code == 'ArrowDown' && curVertNum > 3) {
            curVertNum--;
            this.vertNum--;
        }
        if (current.code == 'ArrowUp' || current.code == 'ArrowDown' || current.code == 'changeN') {
            for (let i = 0; i < this.pointsArray.length; i++) {
                this.pointsArray[i].remove();
            }
            this.pointsArray = [];
            for (let i = 0; i < this.vertNum; i++) {
                this.pointsArray.push(new point(this.x0, this.y0, this, {
                    action: "polygon",
                    attr: "polygon"
                }));
            }
            this.updateAttributes();
        }
    }
    fix(event) {
        event.preventDefault();
        if (event.shiftKey) {
            this.rotationIsFixed = true;
            this.updateAttributes();
        }
        if (event.altKey) {
            this.angleIsFixed = true;
            this.updateAttributes();
        }
        if (event.ctrlKey) {
            this.radiusIsFixed = true;
            this.updateAttributes();
        }
        this.updateAttributes();
    }
    free(event) {
        if (event.key == 'Shift') {
            this.rotationIsFixed = false;
            this.updateAttributes();
        }
        if (event.key == "Alt") {
            this.angleIsFixed = false;
            this.updateAttributes();
        }
        if (event.key == 'Control') {
            this.radiusIsFixed = false;
            this.updateAttributes();
        }
    }
    //MOVE
    move(dx = curX - this.start.x, dy = curY - this.start.y) {
        this.updateFrameAndPoints(this.x0 + dx, this.y0 + dy);
    }
    stopMoving(dx = curX - this.start.x, dy = curY - this.start.y) {
        this.x0 += dx;
        this.y0 += dy;
    }
    moveTo(x, y) {
        let dx = x + pointRadius - (this.x0 - this.r),
            dy = y + pointRadius - (this.y0 - this.r);
        this.move(dx, dy);
        this.stopMoving(dx, dy);
    }
    getCornerCoords() {
        return {
            x: (this.x0 - this.r) - pointRadius,
            y: (this.y0 - this.r) - pointRadius
        }
    }
    //RESIZE
    resize() {
        this.updateAttributes();
    }
    getResizeAttrs() {
        return [
            this.x0,
            this.y0,
            this.r,
            this.phi,
            this.vertNum
        ]
    }
    setResizeAttrs(attrs) {
        let pVertNum = this.vertNum;
        [this.x0, this.y0, this.r, this.phi, this.vertNum] = attrs;
        if (pVertNum != this.vertNum) {
            if (this.arePointsAndFrameShown) {
                for (let i = 0; i < this.pointsArray.length; i++) {
                    this.pointsArray[i].remove();
                }
            }
            this.pointsArray = [];
            for (let i = 0; i < this.vertNum; i++) {
                this.pointsArray.push(new point(this.x0, this.y0, this, {
                    action: "polygon",
                    attr: "polygon"
                }));
                if (!this.isSelected) this.pointsArray[i].hide();
            }
        }
        this.updateFrameAndPoints();
        this.updateParameters();
    }
    //ROTATE
    rotateTo(newAngle) {
        this.phi = newAngle;
        this.updateFrameAndPoints();
        this.updateParameters();
    }
}

//STAR POLYGON
class starPolygon extends object {
    constructor() {
        super('path');
        this.type = 'star';
        this.path = "";
        this.r = 0;
        this.phi = 0;
        this.step = 2;
        this.vertNum = curStarPolygonVertNum;
        this.step = 2;
        this.verticesCoords = [];
        this.frameArray = [new pathFrame(this.path, this)];
        for (let i = 0; i < this.vertNum; i++) {
            this.pointsArray.push(new point(this.x0, this.y0, this, {
                action: "polygon",
                attr: "polygon"
            }));
        }
        this.rotationIsFixed = false;
        this.angleIsFixed = false;
        this.radiusIsFixed = false;
        this.fix = this.fix.bind(this);
        this.free = this.free.bind(this);
        this.updateVertNum = this.updateVertNum.bind(this);
        this.updateStep = this.updateStep.bind(this);
        this.addHotKeys();
    }
    createClone() {
        let clone = new starPolygon();
        super.createClone(clone);
        clone.path = this.path;
        clone.r = this.r;
        clone.phi = this.phi;
        clone.vertNum = this.vertNum;
        clone.step = this.step;
        clone.vertices = this.vertices;
        clone.updateFrameAndPoints();
        return clone;
    }
    addParameters() {
        pol_panel.style.display = "flex";
        step_panel.style.display = "flex";
        polN.min = "5";
    }
    updateParameters() {
        polX.value = this.x0;
        polY.value = this.y0;
        polR.value = this.r;
        polN.value = this.vertNum;
        polS.value = this.step;
        angleInput.value = this.phi * 180.0 / Math.PI;
    }
    removeParameters() {
        pol_panel.style.display = "none";
        step_panel.style.display = "none";
    }
    updateAttributes() {
        let dx = curX - this.x0,
            dy = curY - this.y0;
        if (!this.radiusIsFixed) this.r = Math.sqrt(dx ** 2 + dy ** 2);
        else if (dx != 0 && dy != 0) {
            dx *= this.r / Math.sqrt(dx ** 2 + dy ** 2);
            dy *= this.r / Math.sqrt(dx ** 2 + dy ** 2);
        }
        if (!this.angleIsFixed) {
            if (this.rotationIsFixed) this.phi = (this.vertNum - 2) * Math.PI / (this.vertNum * 2);
            else if (this.r > 0) this.phi = dy > 0 ? Math.acos(dx / this.r) : -Math.acos(dx / this.r);
        }
        this.updateFrameAndPoints();
    }
    updateFrameAndPoints(x0 = this.x0, y0 = this.y0) {
        //включает обновление атрибута
        this.verticesCoords = [];
        for (let i = 0; i < this.vertNum; i++) {
            let x = x0 + this.r * Math.cos(this.phi + 2 * Math.PI * i / this.vertNum);
            let y = y0 + this.r * Math.sin(this.phi + 2 * Math.PI * i / this.vertNum);
            this.verticesCoords.push({
                x: x,
                y: y
            })
            this.pointsArray[i].update(x, y, '');
            if (currentPointTypeAttr == "polygon") {
                if (i == 0) this.pointsArray[i].setPointAttribute("fill", "red");
                else this.pointsArray[i].setPointAttribute("fill", "white");
            }
        }
        this.path = "M " + this.verticesCoords[0].x + "," + this.verticesCoords[0].y;
        this.endInd = 0;
        this.count = 0;
        this.setPath(this.step);
        this.path += "L " + this.verticesCoords[0].x + "," + this.verticesCoords[0].y;
        if (this.vertNum != this.count) {
            for (let i = 1; i < this.step; i++) {
                this.path += "M " + this.verticesCoords[i].x + "," + this.verticesCoords[i].y;
                this.endInd = i;
                this.setPath(this.step + i);
                this.path += "L " + this.verticesCoords[i].x + "," + this.verticesCoords[i].y;
            }
        }

        this.svgElement.setAttribute('d', this.path);
        this.frameArray[0].update(this.path);
        this.path = "";
        this.verticesCoords = [];
    }
    setPath(ind) {
        this.count++;
        if (ind == this.endInd) return;
        this.path += "L " + this.verticesCoords[ind].x + "," + this.verticesCoords[ind].y;
        this.setPath((ind + this.step) % this.vertNum);
    }
    addHotKeys() {
        document.addEventListener('keydown', this.updateVertNum);
        document.addEventListener('keydown', this.updateStep);
        document.addEventListener('keydown', this.fix);
        document.addEventListener('keyup', this.free);
    }
    removeHotKeys() {
        document.removeEventListener('keydown', this.updateVertNum);
        document.removeEventListener('keydown', this.updateStep);
        this.rotationIsFixed = false;
        this.angleIsFixed = false;
        this.radiusIsFixed = false;
        document.removeEventListener('keydown', this.fix);
        document.removeEventListener('keyup', this.free);
    }
    updateVertNum(current) {
        if (current.code == 'ArrowUp') {
            curStarPolygonVertNum++;
            this.vertNum++;
        }
        if (current.code == 'ArrowDown' && curStarPolygonVertNum > 5) {
            curStarPolygonVertNum--;
            this.vertNum--;
        }
        if (current.code == 'ArrowUp' || current.code == 'ArrowDown' || current.code == 'changeN') {
            this.step = 2;
            for (let i = 0; i < this.pointsArray.length; i++) {
                this.pointsArray[i].remove();
            }
            this.pointsArray = [];
            for (let i = 0; i < this.vertNum; i++) {
                this.pointsArray.push(new point(this.x0, this.y0, this, {
                    action: "polygon",
                    attr: "polygon"
                }));
            }
            this.updateAttributes();
        }
    }
    updateStep(current) {
        if (current.code == 'ArrowRight' && this.step + 1 <= Math.floor((this.vertNum - 3) / 2) + 1) {
            this.step++;
        }
        if (current.code == 'ArrowLeft' && this.step - 1 >= 2) {
            this.step--;
        }
        if (current.code == 'ArrowRight' || current.code == 'ArrowLeft') {
            this.updateAttributes();
        }
    }
    fix(event) {
        event.preventDefault();
        if (event.shiftKey) {
            this.rotationIsFixed = true;
            this.updateAttributes();
        }
        if (event.altKey) {
            this.angleIsFixed = true;
            this.updateAttributes();
        }
        if (event.ctrlKey) {
            this.radiusIsFixed = true;
            this.updateAttributes();
        }
    }
    free(event) {
        if (event.key == 'Shift') {
            this.rotationIsFixed = false;
            this.updateAttributes();
        }
        if (event.key == "Alt") {
            this.angleIsFixed = false;
            this.updateAttributes();
        }
        if (event.key == 'Control') {
            this.radiusIsFixed = false;
            this.updateAttributes();
        }
    }
    //MOVE
    move(dx = curX - this.start.x, dy = curY - this.start.y) {
        this.updateFrameAndPoints(this.x0 + dx, this.y0 + dy);
    }
    stopMoving(dx = curX - this.start.x, dy = curY - this.start.y) {
        this.x0 += dx;
        this.y0 += dy;
    }
    moveTo(x, y) {
        let dx = x + pointRadius - (this.x0 - this.r),
            dy = y + pointRadius - (this.y0 - this.r);
        this.move(dx, dy);
        this.stopMoving(dx, dy);
        this.updateParameters();
    }
    getCornerCoords() {
        return {
            x: (this.x0 - this.r) - pointRadius,
            y: (this.y0 - this.r) - pointRadius
        }
    }
    //RESIZE
    resize() {
        this.updateAttributes();
    }
    getResizeAttrs() {
        return [
            this.x0,
            this.y0,
            this.r,
            this.phi,
            this.vertNum,
            this.step
        ]
    }
    setResizeAttrs(attrs) {
        let previousVertNum = this.vertNum;
        [this.x0, this.y0, this.r, this.phi, this.vertNum, this.step] = attrs;
        if (previousVertNum != this.vertNum) {
            if (this.arePointsAndFrameShown) {
                for (let i = 0; i < this.pointsArray.length; i++) {
                    this.pointsArray[i].remove();
                }
            }
            this.pointsArray = [];
            for (let i = 0; i < this.vertNum; i++) {
                this.pointsArray.push(new point(this.x0, this.y0, this, {
                    action: "polygon",
                    attr: "polygon"
                }));
                if (!this.isSelected) this.pointsArray[i].hide();
            }
        }
        this.updateFrameAndPoints();
        this.updateParameters();
    }
    //ROTATE
    rotateTo(newAngle) {
        this.phi = newAngle;
        this.updateFrameAndPoints();
        this.updateParameters();
    }
}


//PENTAGRAM
class pentagram extends object {
    constructor() {
        super('g');
        this.type = 'star';
        this.path = "";
        this.r = 0;
        this.phi = 0;
        this.step = 2;
        this.vertNum = curPentagramVertNum;
        this.step = 2;
        this.verticesCoords = [];
        this.star = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        this.circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
        this.svgElement.appendChild(this.star);
        this.svgElement.appendChild(this.circle);
        this.circle.setAttribute('fill', "none");
        this.frameArray = [new pathFrame(this.path, this),
            new ellipseFrame(this.x0, this.y0, 0, 0, this)
        ];
        for (let i = 0; i < this.vertNum; i++) {
            this.pointsArray.push(new point(this.x0, this.y0, this, {
                action: "polygon",
                attr: "polygon"
            }));
        }
        this.rotationIsFixed = false;
        this.angleIsFixed = false;
        this.radiusIsFixed = false;
        this.fix = this.fix.bind(this);
        this.free = this.free.bind(this);
        this.updateVertNum = this.updateVertNum.bind(this);
        this.updateStep = this.updateStep.bind(this);
        this.addHotKeys();
    }
    createClone() {
        let clone = new pentagram();
        super.createClone(clone);
        clone.path = this.path;
        clone.r = this.r;
        clone.phi = this.phi;
        clone.vertNum = this.vertNum;
        clone.step = this.step;
        clone.vertices = this.vertices;
        clone.updateFrameAndPoints();
        return clone;
    }
    addParameters() {
        pol_panel.style.display = "flex";
        step_panel.style.display = "flex";
        polN.min = "5";
    }
    updateParameters() {
        polX.value = this.x0;
        polY.value = this.y0;
        polR.value = this.r;
        polN.value = this.vertNum;
        polS.value = this.step;
        angleInput.value = this.phi * 180.0 / Math.PI;
    }
    removeParameters() {
        pol_panel.style.display = "none";
        step_panel.style.display = "none";
    }
    updateAttributes() {
        let dx = curX - this.x0,
            dy = curY - this.y0;
        if (!this.radiusIsFixed) this.r = Math.sqrt(dx ** 2 + dy ** 2);
        else if (dx != 0 && dy != 0) {
            dx *= this.r / Math.sqrt(dx ** 2 + dy ** 2);
            dy *= this.r / Math.sqrt(dx ** 2 + dy ** 2);
        }
        if (!this.angleIsFixed) {
            if (this.rotationIsFixed) this.phi = (this.vertNum - 2) * Math.PI / (this.vertNum * 2);
            else if (this.r > 0) this.phi = dy > 0 ? Math.acos(dx / this.r) : -Math.acos(dx / this.r);
        }
        this.updateFrameAndPoints();
    }
    updateFrameAndPoints(x0 = this.x0, y0 = this.y0) {
        //включает обновление атрибута
        this.circle.setAttribute('cx', x0);
        this.circle.setAttribute('cy', y0);
        this.circle.setAttribute('r', this.r + this.strokeWidth);
        this.frameArray[1].update(x0, y0, this.r + this.strokeWidth, this.r + this.strokeWidth);

        this.verticesCoords = [];
        for (let i = 0; i < this.vertNum; i++) {
            let x = x0 + this.r * Math.cos(this.phi + 2 * Math.PI * i / this.vertNum);
            let y = y0 + this.r * Math.sin(this.phi + 2 * Math.PI * i / this.vertNum);
            this.verticesCoords.push({
                x: x,
                y: y
            })
            this.pointsArray[i].update(x, y, '');
            if (currentPointTypeAttr == "polygon") {
                if (i == 0) this.pointsArray[i].setPointAttribute("fill", "red");
                else this.pointsArray[i].setPointAttribute("fill", "white");
            }
        }
        this.path = "M " + this.verticesCoords[0].x + "," + this.verticesCoords[0].y;
        this.endInd = 0;
        this.count = 0;
        this.setPath(this.step);
        this.path += "L " + this.verticesCoords[0].x + "," + this.verticesCoords[0].y;
        if (this.vertNum != this.count) {
            for (let i = 1; i < this.step; i++) {
                this.path += "M " + this.verticesCoords[i].x + "," + this.verticesCoords[i].y;
                this.endInd = i;
                this.setPath(this.step + i);
                this.path += "L " + this.verticesCoords[i].x + "," + this.verticesCoords[i].y;
            }
        }

        this.star.setAttribute('d', this.path);
        this.frameArray[0].update(this.path);
        this.path = "";
        this.verticesCoords = [];
    }
    setPath(ind) {
        this.count++;
        if (ind == this.endInd) return;
        this.path += "L " + this.verticesCoords[ind].x + "," + this.verticesCoords[ind].y;
        this.setPath((ind + this.step) % this.vertNum);
    }
    addHotKeys() {
        document.addEventListener('keydown', this.updateVertNum);
        document.addEventListener('keydown', this.updateStep);
        document.addEventListener('keydown', this.fix);
        document.addEventListener('keyup', this.free);
    }
    removeHotKeys() {
        document.removeEventListener('keydown', this.updateVertNum);
        document.removeEventListener('keydown', this.updateStep);
        this.rotationIsFixed = false;
        this.angleIsFixed = false;
        this.radiusIsFixed = false;
        document.removeEventListener('keydown', this.fix);
        document.removeEventListener('keyup', this.free);
    }
    updateVertNum(current) {
        if (current.code == 'ArrowUp') {
            curPentagramVertNum++;
            this.vertNum++;
        }
        if (current.code == 'ArrowDown' && curPentagramVertNum > 5) {
            curPentagramVertNum--;
            this.vertNum--;
        }
        if (current.code == 'ArrowUp' || current.code == 'ArrowDown' || current.code == 'changeN') {
            this.step = 2;
            for (let i = 0; i < this.pointsArray.length; i++) {
                this.pointsArray[i].remove();
            }
            this.pointsArray = [];
            for (let i = 0; i < this.vertNum; i++) {
                this.pointsArray.push(new point(this.x0, this.y0, this, {
                    action: "polygon",
                    attr: "polygon"
                }));
            }
            this.updateAttributes();
        }
    }
    updateStep(current) {
        if (current.code == 'ArrowRight' && this.step + 1 <= Math.floor((this.vertNum - 3) / 2) + 1) {
            this.step++;
        }
        if (current.code == 'ArrowLeft' && this.step - 1 >= 2) {
            this.step--;
        }
        if (current.code == 'ArrowRight' || current.code == 'ArrowLeft') {
            this.updateAttributes();
        }
    }
    fix(event) {
        event.preventDefault();
        if (event.shiftKey) {
            this.rotationIsFixed = true;
            this.updateAttributes();
        }
        if (event.altKey) {
            this.angleIsFixed = true;
            this.updateAttributes();
        }
        if (event.ctrlKey) {
            this.radiusIsFixed = true;
            this.updateAttributes();
        }
    }
    free(event) {
        if (event.key == 'Shift') {
            this.rotationIsFixed = false;
            this.updateAttributes();
        }
        if (event.key == "Alt") {
            this.angleIsFixed = false;
            this.updateAttributes();
        }
        if (event.key == 'Control') {
            this.radiusIsFixed = false;
            this.updateAttributes();
        }
    }
    //MOVE
    move(dx = curX - this.start.x, dy = curY - this.start.y) {
        this.updateFrameAndPoints(this.x0 + dx, this.y0 + dy);
    }
    stopMoving(dx = curX - this.start.x, dy = curY - this.start.y) {
        this.x0 += dx;
        this.y0 += dy;
    }
    moveTo(x, y) {
        let dx = x + pointRadius - (this.x0 - this.r),
            dy = y + pointRadius - (this.y0 - this.r);
        this.move(dx, dy);
        this.stopMoving(dx, dy);
        this.updateParameters();
    }
    getCornerCoords() {
        return {
            x: (this.x0 - this.r) - pointRadius,
            y: (this.y0 - this.r) - pointRadius
        }
    }
    //RESIZE
    resize() {
        this.updateAttributes();
    }
    getResizeAttrs() {
        return [
            this.x0,
            this.y0,
            this.r,
            this.phi,
            this.vertNum,
            this.step
        ]
    }
    setResizeAttrs(attrs) {
        let previousVertNum = this.vertNum;
        [this.x0, this.y0, this.r, this.phi, this.vertNum, this.step] = attrs;
        if (previousVertNum != this.vertNum) {
            if (this.arePointsAndFrameShown) {
                for (let i = 0; i < this.pointsArray.length; i++) {
                    this.pointsArray[i].remove();
                }
            }
            this.pointsArray = [];
            for (let i = 0; i < this.vertNum; i++) {
                this.pointsArray.push(new point(this.x0, this.y0, this, {
                    action: "polygon",
                    attr: "polygon"
                }));
                if (!this.isSelected) this.pointsArray[i].hide();
            }
        }
        this.updateFrameAndPoints();
        this.updateParameters();
    }
    //ROTATE
    rotateTo(newAngle) {
        this.phi = newAngle;
        this.updateFrameAndPoints();
        this.updateParameters();
    }
}

//PENCIL
class pencil extends object {
    constructor() {
        super('polyline', 'pencil');
        this.type = 'pencil';
        this.path = this.x0 + "," + this.y0;
        this.pathCoords = [{
            x: this.x0,
            y: this.y0
        }];
        this.svgElement.setAttribute('fill', "none");
        this.svgElement.setAttribute('points', this.path);
        this.minX = this.x0;
        this.minY = this.y0;
        this.maxX = this.x0;
        this.maxY = this.y0;
        this.cPoint = {
            x: this.minX + (this.maxX - this.minX) / 2,
            y: this.minY + (this.maxY - this.minY) / 2
        };
        this.transform = 'rotate(' + 0 + ' ' + this.cPoint.x + ' ' + this.cPoint.y + ')';
        makeRoundStroke(this);
        //rotate 
        this.angle = 0;
    }
    createClone() {
        let clone = new pencil();
        super.createClone(clone);
        clone.minX = this.minX;
        clone.minY = this.minY;
        clone.maxX = this.maxX;
        clone.maxY = this.maxY;
        clone.cPoint = this.cPoint;
        clone.angle = this.angle;
        clone.transform = this.transform;
        clone.svgElement.setAttribute('transform', this.transform);
        clone.svgElement.setAttribute('fill', "none");
        clone.path = "";
        clone.pathCoords = [];
        for (let i = 0; i < this.pathCoords.length; i++) {
            clone.pathCoords[i] = {
                x: 0,
                y: 0
            }
            clone.pathCoords[i].x = this.pathCoords[i].x;
            clone.pathCoords[i].y = this.pathCoords[i].y;
        }
        clone.updateFrameAndPoints();
        return clone;
    }
    addParameters() {
        pen_panel.style.display = "flex";
    }
    updateParameters() {
        penX.value = this.minX;
        penY.value = this.minY;
        angleInput.value = this.angle * 180.0 / Math.PI;
    }
    removeParameters() {
        pen_panel.style.display = "none";
    }
    updateAttributes() {
        this.path += " " + curX + "," + curY;
        this.pathCoords.push({
            x: curX,
            y: curY
        });
        this.svgElement.setAttribute('points', this.path);
        this.minX = Math.min(this.minX, curX);
        this.minY = Math.min(this.minY, curY);
        this.maxX = Math.max(this.maxX, curX);
        this.maxY = Math.max(this.maxY, curY);
        this.cPoint = {
            x: this.minX + (this.maxX - this.minX) / 2,
            y: this.minY + (this.maxY - this.minY) / 2
        };
    }
    updateFrameAndPoints(dx = 0, dy = 0, minX = this.minX, minY = this.minY, maxX = this.maxX, maxY = this.maxY, transform = this.transform, pathCoords = this.pathCoords) {
        //включает обновление атрибута
        for (let i = 0; i < pathCoords.length; i++) {
            let newX = pathCoords[i].x + dx,
                newY = pathCoords[i].y + dy;
            if (i == 0) this.path = newX + "," + newY;
            else this.path += " " + newX + "," + newY;
        }
        this.svgElement.setAttribute('points', this.path);

        this.frameArray[0].update(minX, maxY, maxX, maxY, transform);
        this.frameArray[1].update(maxX, maxY, maxX, minY, transform);
        this.frameArray[2].update(maxX, minY, minX, minY, transform);
        this.frameArray[3].update(minX, minY, minX, maxY, transform);
        this.frameArray[4].update(this.path, transform);
        this.pointsArray[0].update(minX, minY, transform);
        this.pointsArray[1].update(minX + (maxX - minX) / 2, minY, transform);
        this.pointsArray[2].update(maxX, minY, transform);
        this.pointsArray[3].update(maxX, minY + (maxY - minY) / 2, transform);
        this.pointsArray[4].update(maxX, maxY, transform);
        this.pointsArray[5].update(minX + (maxX - minX) / 2, maxY, transform);
        this.pointsArray[6].update(minX, maxY, transform);
        this.pointsArray[7].update(minX, minY + (maxY - minY) / 2, transform);
        this.pointsArray[8].update(minX + (maxX - minX) / 2, minY + (maxY - minY) / 2, transform);
        this.pointsArray[9].update(Math.min(minX, maxX) + (Math.max(minX, maxX) - Math.min(minX, maxX)) / 2, Math.min(minY, maxY) - 20, transform);
        this.path = "";
    }
    //MOVE
    move(dx = curX - this.start.x, dy = curY - this.start.y) {
        this.updateFrameAndPoints(getRotateCoords(dx, dy, this.angle).x, getRotateCoords(dx, dy, this.angle).y,
            this.minX + getRotateCoords(dx, dy, this.angle).x,
            this.minY + getRotateCoords(dx, dy, this.angle).y,
            this.maxX + getRotateCoords(dx, dy, this.angle).x,
            this.maxY + getRotateCoords(dx, dy, this.angle).y,
            this.transform
        );
    }
    stopMoving(dx = curX - this.start.x, dy = curY - this.start.y) {
        this.x0 += dx;
        this.y0 += dy;
        this.minX += dx;
        this.minY += dy;
        this.maxX += dx;
        this.maxY += dy;
        this.cPoint = {
            x: this.minX + (this.maxX - this.minX) / 2,
            y: this.minY + (this.maxY - this.minY) / 2
        };
        for (let i = 0; i < this.pathCoords.length; i++) {
            this.pathCoords[i].x += dx;
            this.pathCoords[i].y += dy;
        }
        this.transform = 'rotate(' + this.angle * 180.0 / Math.PI + ' ' + this.cPoint.x + ' ' + this.cPoint.y + ')';
        this.svgElement.setAttribute('transform', this.transform);
        this.updateFrameAndPoints();
    }
    moveTo(x, y) {
        let dx = x + pointRadius - this.minX,
            dy = y + pointRadius - this.minY;
        this.move(dx, dy);
        this.stopMoving(dx, dy);
        this.updateParameters();
    }
    getCornerCoords() {
        return {
            x: this.minX - pointRadius,
            y: this.minY - pointRadius
        }
    }
    //RESIZE
    startResize() {
        this.resizeTemp = {
            pathCoords: this.pathCoords,
            minX: this.minX,
            minY: this.minY,
            maxX: this.maxX,
            maxY: this.maxY,
        }
    }
    resize(dx, dy) {
        let new_dx = getRotateCoords(dx, dy, this.angle).x,
            new_dy = getRotateCoords(dx, dy, this.angle).y;

        let n = {
            pathCoords: [],
            minX: this.minX,
            minY: this.minY,
            maxX: this.maxX,
            maxY: this.maxY,
        };
        n.pathCoords = [];
        for (let i = 0; i < this.pathCoords.length; i++) {
            n.pathCoords[i] = {
                x: 0,
                y: 0
            }
            n.pathCoords[i].x = this.pathCoords[i].x;
            n.pathCoords[i].y = this.pathCoords[i].y;
        }

        let kx = 0,
            ky = 0,
            diffX = 0,
            diffY = 0,
            qx = 1,
            qy = 1;
        switch (currentPointTypeAttr) {
            case "ltc":
                kx = 1 - (n.maxX - (n.minX + new_dx)) / (n.maxX - n.minX);
                n.minX += new_dx;
                diffX = n.maxX;

                ky = 1 - (n.maxY - (n.minY + new_dy)) / (n.maxY - n.minY);
                n.minY += new_dy;
                diffY = n.maxY;
                break;
            case "t":
                ky = 1 - (n.maxY - (n.minY + new_dy)) / (n.maxY - n.minY);
                n.minY += new_dy;
                diffY = n.maxY;
                break;
            case "rtc":
                kx = 1 - (n.maxX - (n.minX + new_dx)) / (n.maxX - n.minX);
                n.maxX += new_dx;
                diffX = n.minX;
                qx = -1;

                ky = 1 - (n.maxY - (n.minY + new_dy)) / (n.maxY - n.minY);
                n.minY += new_dy;
                diffY = n.maxY;
                break;
            case "r":
                kx = 1 - (n.maxX - (n.minX + new_dx)) / (n.maxX - n.minX);
                n.maxX += new_dx;
                diffX = n.minX;
                qx = -1;
                break;
            case "rbc":
                kx = 1 - (n.maxX - (n.minX + new_dx)) / (n.maxX - n.minX);
                n.maxX += new_dx;
                diffX = n.minX;
                qx = -1;

                ky = 1 - (n.maxY - (n.minY + new_dy)) / (n.maxY - n.minY);
                n.maxY += new_dy;
                diffY = n.minY;
                qy = -1;
                break;
            case "b":
                ky = 1 - (n.maxY - (n.minY + new_dy)) / (n.maxY - n.minY);
                n.maxY += new_dy;
                diffY = n.minY;
                qy = -1;
                break;
            case "lbc":
                kx = 1 - (n.maxX - (n.minX + new_dx)) / (n.maxX - n.minX);
                n.minX += new_dx;
                diffX = n.maxX;

                ky = 1 - (n.maxY - (n.minY + new_dy)) / (n.maxY - n.minY);
                n.maxY += new_dy;
                diffY = n.minY;
                qy = -1;
                break;
            case "l":
                kx = 1 - (n.maxX - (n.minX + new_dx)) / (n.maxX - n.minX);
                n.minX += new_dx;
                diffX = n.maxX;
                break;
        }
        for (let i = 0; i < n.pathCoords.length; i++) {
            n.pathCoords[i].x = n.pathCoords[i].x + qx * (diffX - n.pathCoords[i].x) * kx;
            n.pathCoords[i].y = n.pathCoords[i].y + qy * (diffY - n.pathCoords[i].y) * ky;
        }
        this.resizeTemp = n;
        this.updateFrameAndPoints(0, 0, n.minX, n.minY, n.maxX, n.maxY, this.transform, n.pathCoords);
    }
    stopResize() {
        this.pathCoords = this.resizeTemp.pathCoords;
        this.minX = Math.min(this.resizeTemp.minX, this.resizeTemp.maxX);
        this.minY = Math.min(this.resizeTemp.minY, this.resizeTemp.maxY);
        this.maxX = Math.max(this.resizeTemp.minX, this.resizeTemp.maxX);
        this.maxY = Math.max(this.resizeTemp.minY, this.resizeTemp.maxY);

        this.cPoint = {
            x: this.minX + (this.maxX - this.minX) / 2,
            y: this.minY + (this.maxY - this.minY) / 2
        };
        this.transform = 'rotate(' + this.angle * 180.0 / Math.PI + ' ' + this.cPoint.x + ' ' + this.cPoint.y + ')';
        this.svgElement.setAttribute('transform', this.transform);
        this.updateFrameAndPoints();
    }
    //ROTATE
    startRotating() {
        this.rPoint = {
            x: this.getNewCoords(this.minX + (this.maxX - this.minX) / 2, this.minY - 20, this.angle).x,
            y: this.getNewCoords(this.minX + (this.maxX - this.minX) / 2, this.minY - 20, this.angle).y,
        }
    }
    rotate(angle = this.angle) {
        let firstSide = Math.sqrt(Math.pow(Math.abs(this.rPoint.x - this.cPoint.x), 2) + Math.pow(Math.abs(this.rPoint.y - this.cPoint.y), 2)),
            secondSide = Math.sqrt(Math.pow(Math.abs(curX - this.cPoint.x), 2) + Math.pow(Math.abs(curY - this.cPoint.y), 2)),
            thirdSide = (Math.sqrt(Math.pow(Math.abs(curX - this.rPoint.x), 2) + Math.pow(Math.abs(curY - this.rPoint.y), 2))),
            angleCos = (Math.pow(firstSide, 2) + Math.pow(secondSide, 2) - Math.pow(thirdSide, 2)) / (2 * firstSide * secondSide),
            newAngle;
        if (secondSide == 0) newAngle = this.angle;
        else newAngle = getRotateCoords(curX, curY, angle).x >= getRotateCoords(this.cPoint.x, this.cPoint.y, angle).x ?
            Math.acos(angleCos) + angle : 2 * Math.PI - Math.acos(angleCos) + angle;
        this.transform = 'rotate(' + newAngle * 180.0 / Math.PI + ' ' + this.cPoint.x + ' ' + this.cPoint.y + ')';
        this.svgElement.setAttribute('transform', this.transform);
        this.updateFrameAndPoints();
    }
    stopRotating() {
        let argss = this.transform.split('(')[1],
            args = argss.split(')')[0],
            newAngle = args.split(' ')[0] * Math.PI / 180.0;
        this.angle = newAngle;
        this.angle = this.angle > 2 * Math.PI ? this.angle - 2 * Math.PI : this.angle;
        this.updateFrameAndPoints();
    }
    rotateTo(newAngle) {
        this.transform = 'rotate(' + newAngle * 180.0 / Math.PI + ' ' + this.cPoint.x + ' ' + this.cPoint.y + ')';
        this.svgElement.setAttribute('transform', this.transform);
        this.angle = newAngle;
        this.angle = this.angle > 2 * Math.PI ? this.angle - 2 * Math.PI : this.angle;
        this.updateFrameAndPoints();
        this.updateParameters();
    }
    getNewCoords(x = this.x0, y = this.y0, angle = this.angle) {
        return {
            x: (x - this.cPoint.x) * Math.cos(angle) - (y - this.cPoint.y) * Math.sin(angle) + this.cPoint.x,
            y: (x - this.cPoint.x) * Math.sin(angle) + (y - this.cPoint.y) * Math.cos(angle) + this.cPoint.y
        }
    }
    getNewCoords(x = this.x0, y = this.y0, angle = this.angle) {
        return {
            x: (x - this.cPoint.x) * Math.cos(angle) - (y - this.cPoint.y) * Math.sin(angle) + this.cPoint.x,
            y: (x - this.cPoint.x) * Math.sin(angle) + (y - this.cPoint.y) * Math.cos(angle) + this.cPoint.y
        }
    }
    complete() {
        this.frameArray = [new lineFrame(this.minX, this.maxY, this.maxX, this.maxY, this, true),
            new lineFrame(this.maxX, this.maxY, this.maxX, this.minY, this, true),
            new lineFrame(this.maxX, this.minY, this.minX, this.minY, this, true),
            new lineFrame(this.minX, this.minY, this.minX, this.maxY, this, true),
            new polylineFrame(this.path, this)
        ];
        this.pointsArray = [new point(this.minX, this.minY, this, {
                action: "resize",
                attr: "ltc"
            }),
            new point(this.minX + (this.maxX - this.minX) / 2, this.minY, this, {
                action: "resize",
                attr: "t"
            }),
            new point(this.maxX, this.minY, this, {
                action: "resize",
                attr: "rtc"
            }),
            new point(this.maxX, this.minY + (this.maxY - this.minY) / 2, this, {
                action: "resize",
                attr: "r"
            }),
            new point(this.maxX, this.maxY, this, {
                action: "resize",
                attr: "rbc"
            }),
            new point(this.minX + (this.maxX - this.minX) / 2, this.maxY, this, {
                action: "resize",
                attr: "b"
            }),
            new point(this.minX, this.maxY, this, {
                action: "resize",
                attr: "lbc"
            }),
            new point(this.minX, this.minY + (this.maxY - this.minY) / 2, this, {
                action: "resize",
                attr: "l"
            }),
            new point(this.minX + (this.maxX - this.minX) / 2, this.minY + (this.maxY - this.minY) / 2, this, {
                action: "move",
                attr: "move"
            }),
            new point(this.minX + (this.maxX - this.minX) / 2, this.minY - 20, this, {
                action: "rotate",
                attr: "rotate"
            })
        ];
        makePrevStroke();
        super.complete(this.path != this.x0 + "," + this.y0);
        this.path = "";
    }
}

//LINE
class line extends object {
    constructor(x1 = curX, y1 = curY, x2 = curX, y2 = curY, isFree = true) {
        super('line');
        this.x0 = x1;
        this.y0 = y1;
        this.svgElement.setAttribute('x1', x1);
        this.svgElement.setAttribute('y1', y1);
        this.svgElement.setAttribute('x2', x2);
        this.svgElement.setAttribute('y2', y2);
        this.x2 = x2;
        this.y2 = y2;
        this.svgElement.setAttribute('fill', "none");
        this.isFree = isFree;
        this.cPoint = {
            x: curX,
            y: curY
        };
        this.transform = 'rotate(' + 0 + ' ' + this.cPoint.x + ' ' + this.cPoint.y + ')';
        if (!isFree) {
            this.svgElement.setAttribute('stroke', "black");
            this.svgElement.setAttribute('stroke-opacity', "0.5");
            this.svgElement.setAttribute('stroke-width', "2");
            this.svgElement.setAttribute('stroke-dasharray', "8");
        } else {
            this.frameArray = [new rectangleFrame(Math.min(this.x0, this.x2), Math.min(this.y0, this.y2), Math.abs(this.x2 - this.x0), Math.abs(this.y2 - this.y0), this, true),
                new lineFrame(this.x0, this.y0, this.x2, this.y2, this)
            ]
            this.pointsArray = [new point(this.x0, this.y0, this, {
                    action: "resize",
                    attr: "ltc"
                }),
                new point(this.x0 + (this.x2 - this.x0) / 2, this.y0, this, {
                    action: "resize",
                    attr: "t"
                }),
                new point(this.x2, this.y0, this, {
                    action: "resize",
                    attr: "rtc"
                }),
                new point(this.x2, this.y0 + (this.y2 - this.y0) / 2, this, {
                    action: "resize",
                    attr: "r"
                }),
                new point(this.x2, this.y2, this, {
                    action: "resize",
                    attr: "rbc"
                }),
                new point(this.x0 + (this.x2 - this.x0) / 2, this.y2, this, {
                    action: "resize",
                    attr: "b"
                }),
                new point(this.x0, this.y2, this, {
                    action: "resize",
                    attr: "lbc"
                }),
                new point(this.x0, this.y0 + (this.y2 - this.y0) / 2, this, {
                    action: "resize",
                    attr: "l"
                }),
                new point(this.x0 + (this.x2 - this.x0) / 2, this.y0 + (this.y2 - this.y0) / 2, this, {
                    action: "move",
                    attr: "move"
                }),
                new point(this.x0 + (this.x2 - this.x0) / 2, this.y0 + (this.y2 - this.y0) / 2 - 20, this, {
                    action: "rotate",
                    attr: "rotate"
                }),
            ];
        }
        //rotate 
        this.angle = 0;
    }
    createClone() {
        let clone = new line();
        super.createClone(clone);
        clone.transform = this.transform;
        clone.x0 = this.x0;
        clone.y0 = this.y0;
        clone.x2 = this.x2;
        clone.y2 = this.y2;
        clone.isFree = this.isFree;
        clone.cPoint = this.cPoint;
        clone.angle = this.angle;
        clone.svgElement.setAttribute('x1', this.x0);
        clone.svgElement.setAttribute('y1', this.y0);
        clone.svgElement.setAttribute('x2', this.x2);
        clone.svgElement.setAttribute('y2', this.y2);
        clone.svgElement.setAttribute('fill', "none");
        clone.svgElement.setAttribute('transform', this.transform);
        return clone;
    }
    addParameters() {
        line_panel.style.display = "flex";
    }
    updateParameters() {
        lineX1.value = this.x0;
        lineY1.value = this.y0;
        lineX2.value = this.x2;
        lineY2.value = this.y2;
        let x1x2 = this.x2 - this.x0;
        let y1y2 = this.y2 - this.y0;
        this.len = Math.sqrt(x1x2 ** 2 + y1y2 ** 2);
        lineL.value = this.len;
        this.sin = Math.abs(x1x2 / this.len);
        this.cos = Math.abs(y1y2 / this.len);
        angleInput.value = this.angle * 180.0 / Math.PI;
    }
    removeParameters() {
        line_panel.style.display = "none";
    }
    updateAttributes(current) {
        let w = curX - this.x0;
        let h = curY - this.y0;
        let signW = w > 0 ? 1 : -1;
        let signH = h > 0 ? 1 : -1;
        let absW = Math.abs(w);
        let absH = Math.abs(h);
        if (current.shiftKey) {
            if (absH < absW) {
                if (absH / absW < Math.tan(Math.PI / 8)) absH = 0;
                else absW = absH;
            } else {
                if (absW / absH < Math.tan(Math.PI / 8)) absW = 0;
                else absH = absW;
            }
        }
        this.x2 = this.x0 + signW * absW;
        this.y2 = this.y0 + signH * absH;
        this.cPoint = {
            x: (this.x0 + this.x2) / 2,
            y: (this.y0 + this.y2) / 2
        };
        this.svgElement.setAttribute('x2', this.x2);
        this.svgElement.setAttribute('y2', this.y2);
        if (this.isFree) {
            this.updateFrameAndPoints(this.x0, this.y0, this.x2, this.y2, this.transform);
        }
        this.angleX2 = this.x2;
        this.angleY2 = this.y2;
    }
    updateFrameAndPoints(x0 = this.x0, y0 = this.y0, x2 = this.x2, y2 = this.y2, transform = this.transform) {
        this.frameArray[0].update(Math.min(x0, x2), Math.min(y0, y2), Math.abs(x2 - x0), Math.abs(y2 - y0), transform);
        this.frameArray[1].update(x0, y0, x2, y2, transform);

        this.pointsArray[0].update(x0, y0, transform);
        this.pointsArray[1].update(x0 + (x2 - x0) / 2, y0, transform);
        this.pointsArray[2].update(x2, y0, transform);
        this.pointsArray[3].update(x2, y0 + (y2 - y0) / 2, transform);
        this.pointsArray[4].update(x2, y2, transform);
        this.pointsArray[5].update(x0 + (x2 - x0) / 2, y2, transform);
        this.pointsArray[6].update(x0, y2, transform);
        this.pointsArray[7].update(x0, y0 + (y2 - y0) / 2, transform);
        this.pointsArray[8].update(x0 + (x2 - x0) / 2, y0 + (y2 - y0) / 2, transform);
        this.pointsArray[9].update(x0 + (x2 - x0) / 2, y0 + (y2 - y0) / 2 - 25, transform);
    }
    //MOVE
    move(dx = curX - this.start.x, dy = curY - this.start.y) {
        let new_dx = getRotateCoords(dx, dy, this.angle).x,
            new_dy = getRotateCoords(dx, dy, this.angle).y;
        this.svgElement.setAttribute('x1', this.x0 + new_dx);
        this.svgElement.setAttribute('y1', this.y0 + new_dy);
        this.svgElement.setAttribute('x2', this.x2 + new_dx);
        this.svgElement.setAttribute('y2', this.y2 + new_dy);
        this.updateFrameAndPoints(this.x0 + new_dx,
            this.y0 + new_dy,
            this.x2 + new_dx,
            this.y2 + new_dy,
            this.transform
        );
    }
    stopMoving(dx = curX - this.start.x, dy = curY - this.start.y) {
        this.x0 += dx;
        this.y0 += dy;
        this.x2 += dx;
        this.y2 += dy;
        this.cPoint = {
            x: (this.x0 + this.x2) / 2,
            y: (this.y0 + this.y2) / 2
        };
        this.svgElement.setAttribute('x1', this.x0);
        this.svgElement.setAttribute('y1', this.y0);
        this.svgElement.setAttribute('x2', this.x2);
        this.svgElement.setAttribute('y2', this.y2);
        this.transform = 'rotate(' + this.angle * 180.0 / Math.PI + ' ' + this.cPoint.x + ' ' + this.cPoint.y + ')';
        this.svgElement.setAttribute('transform', this.transform);
    }
    moveTo(x, y) {
        let dx = x + pointRadius - Math.min(this.x0, this.x2),
            dy = y + pointRadius - Math.min(this.y0, this.y2);
        this.move(dx, dy);
        this.stopMoving(dx, dy);
        this.updateParameters();
    }
    getCornerCoords() {
        return {
            x: Math.min(this.x0, this.x2) - pointRadius,
            y: Math.min(this.y0, this.y2) - pointRadius
        }
    }
    //RESIZE
    startResize() {
        this.resizeTemp = {
            x0: this.x0,
            y0: this.y0,
            x2: this.x2,
            y2: this.y2
        };
    }
    resize(dx, dy) {
        let new_dx = getRotateCoords(dx, dy, this.angle).x,
            new_dy = getRotateCoords(dx, dy, this.angle).y;
        let n = {
            x0: this.x0,
            y0: this.y0,
            x2: this.x2,
            y2: this.y2
        };
        switch (currentPointTypeAttr) {
            case "ltc":
                n.x0 += new_dx;
                n.y0 += new_dy;
                break;
            case "t":
                n.y0 += new_dy;
                break;
            case "rtc":
                n.x2 += new_dx;
                n.y0 += new_dy;
                break;
            case "r":
                n.x2 += new_dx;
                break;
            case "rbc":
                n.x2 += new_dx;
                n.y2 += new_dy;
                break;
            case "b":
                n.y2 += new_dy;
                break;
            case "lbc":
                n.x0 += new_dx;
                n.y2 += new_dy;
                break;
            case "l":
                n.x0 += new_dx;
                break;
        }
        this.resizeTemp = n;
        this.svgElement.setAttribute('x1', n.x0);
        this.svgElement.setAttribute('y1', n.y0);
        this.svgElement.setAttribute('x2', n.x2);
        this.svgElement.setAttribute('y2', n.y2);
        this.updateFrameAndPoints(n.x0, n.y0, n.x2, n.y2, this.transform);
    }
    stopResize() {
        let new_x = this.getNewCoords((this.resizeTemp.x0 + this.resizeTemp.x2) / 2, (this.resizeTemp.y0 + this.resizeTemp.y2) / 2, this.angle).x,
            new_y = this.getNewCoords((this.resizeTemp.x0 + this.resizeTemp.x2) / 2, (this.resizeTemp.y0 + this.resizeTemp.y2) / 2, this.angle).y,
            new_x0 = this.getNewCoords(this.resizeTemp.x0, this.resizeTemp.y0, this.angle).x,
            new_y0 = this.getNewCoords(this.resizeTemp.x0, this.resizeTemp.y0, this.angle).y,
            new_x2 = this.getNewCoords(this.resizeTemp.x2, this.resizeTemp.y2, this.angle).x,
            new_y2 = this.getNewCoords(this.resizeTemp.x2, this.resizeTemp.y2, this.angle).y;
        this.cPoint = {
            x: new_x,
            y: new_y
        };
        this.x0 = this.getNewCoords(new_x0, new_y0, -this.angle).x;
        this.y0 = this.getNewCoords(new_x0, new_y0, -this.angle).y;
        this.x2 = this.getNewCoords(new_x2, new_y2, -this.angle).x;
        this.y2 = this.getNewCoords(new_x2, new_y2, -this.angle).y;
        this.svgElement.setAttribute('x1', this.x0);
        this.svgElement.setAttribute('y1', this.y0);
        this.svgElement.setAttribute('x2', this.x2);
        this.svgElement.setAttribute('y2', this.y2);
        this.transform = 'rotate(' + this.angle * 180.0 / Math.PI + ' ' + this.cPoint.x + ' ' + this.cPoint.y + ')';
        this.svgElement.setAttribute('transform', this.transform);
        this.updateFrameAndPoints();
    }
    getResizeAttrs() {
        return [
            Number(this.getElementAttribute('x1')),
            Number(this.getElementAttribute('y1')),
            Number(this.getElementAttribute('x2')),
            Number(this.getElementAttribute('y2'))
        ]
    }
    setResizeAttrs(attrs) {
        [this.x0, this.y0, this.x2, this.y2] = attrs;
        this.cPoint = {
            x: (this.x0 + this.x2) / 2,
            y: (this.y0 + this.y2) / 2
        };
        this.svgElement.setAttribute('x1', this.x0);
        this.svgElement.setAttribute('y1', this.y0);
        this.svgElement.setAttribute('x2', this.x2);
        this.svgElement.setAttribute('y2', this.y2);
        this.transform = 'rotate(' + this.angle * 180.0 / Math.PI + ' ' + this.cPoint.x + ' ' + this.cPoint.y + ')';
        this.svgElement.setAttribute('transform', this.transform);
        this.updateFrameAndPoints();
        this.updateParameters();
    }
    //ROTATE
    startRotating() {
        this.rPoint = {
            x: this.getNewCoords(this.x0 + (this.x2 - this.x0) / 2, this.y0 + (this.y2 - this.y0) / 2 - 25, this.angle).x,
            y: this.getNewCoords(this.x0 + (this.x2 - this.x0) / 2, this.y0 + (this.y2 - this.y0) / 2 - 25, this.angle).y
        };
    }
    rotate(angle = this.angle) {
        let firstSide = Math.sqrt(Math.pow(Math.abs(this.rPoint.x - this.cPoint.x), 2) + Math.pow(Math.abs(this.rPoint.y - this.cPoint.y), 2)),
            secondSide = Math.sqrt(Math.pow(Math.abs(curX - this.cPoint.x), 2) + Math.pow(Math.abs(curY - this.cPoint.y), 2)),
            thirdSide = (Math.sqrt(Math.pow(Math.abs(curX - this.rPoint.x), 2) + Math.pow(Math.abs(curY - this.rPoint.y), 2))),
            angleCos = (Math.pow(firstSide, 2) + Math.pow(secondSide, 2) - Math.pow(thirdSide, 2)) / (2 * firstSide * secondSide),
            newAngle;
        if (secondSide == 0) newAngle = this.angle;
        else newAngle = getRotateCoords(curX, curY, angle).x >= getRotateCoords(this.cPoint.x, this.cPoint.y, angle).x ?
            Math.acos(angleCos) + angle : 2 * Math.PI - Math.acos(angleCos) + angle;
        this.svgElement.setAttribute('x1', this.x0);
        this.svgElement.setAttribute('y1', this.y0);
        this.svgElement.setAttribute('x2', this.x2);
        this.svgElement.setAttribute('y2', this.y2);
        this.transform = 'rotate(' + newAngle * 180.0 / Math.PI + ' ' + this.cPoint.x + ' ' + this.cPoint.y + ')';
        this.svgElement.setAttribute('transform', this.transform);
        this.updateFrameAndPoints();
    }
    stopRotating() {
        let argss = this.transform.split('(')[1],
            args = argss.split(')')[0],
            newAngle = args.split(' ')[0] * Math.PI / 180.0;
        this.angle = newAngle;
        this.angle = this.angle > 2 * Math.PI ? this.angle - 2 * Math.PI : this.angle;
        this.updateFrameAndPoints();
    }
    rotateTo(newAngle) {
        this.svgElement.setAttribute('x1', this.x0);
        this.svgElement.setAttribute('y1', this.y0);
        this.svgElement.setAttribute('x2', this.x2);
        this.svgElement.setAttribute('y2', this.y2);
        this.transform = 'rotate(' + newAngle * 180.0 / Math.PI + ' ' + this.cPoint.x + ' ' + this.cPoint.y + ')';
        this.svgElement.setAttribute('transform', this.transform);
        this.angle = newAngle;
        this.angle = this.angle > 2 * Math.PI ? this.angle - 2 * Math.PI : this.angle;
        this.updateFrameAndPoints();
        this.updateParameters();
    }
    getNewCoords(x = this.x0, y = this.y0, angle = this.angle) {
        return {
            x: (x - this.cPoint.x) * Math.cos(angle) - (y - this.cPoint.y) * Math.sin(angle) + this.cPoint.x,
            y: (x - this.cPoint.x) * Math.sin(angle) + (y - this.cPoint.y) * Math.cos(angle) + this.cPoint.y
        }
    }
}

//POLYLINE
class polyline extends object {
    constructor() {
        super('polyline');
        this.path = this.x0 + "," + this.y0;
        this.pathCoords = [{
            x: this.x0,
            y: this.y0
        }];
        this.svgElement.setAttribute('points', this.path);
        this.frameArray = [new polylineFrame(this.path, this)];
        this.pointsArray.push(new point(this.x0, this.y0, this, {
            action: "polyline",
            attr: 0
        }));
        this.pointsArray[0].setPointAttribute('fill', "blue");
        this.line = new line(curX, curY, curX, curY, false);
        this.minX = this.x0;
        this.minY = this.y0;
        this.maxX = this.x0;
        this.maxY = this.y0;
        this.cPoint = {
            x: this.minX + (this.maxX - this.minX) / 2,
            y: this.minY + (this.maxY - this.minY) / 2
        };
        //rotate
        this.transform = 'rotate(' + 0 + ' ' + this.cPoint.x + ' ' + this.cPoint.y + ')';
        this.angle = 0;
    }
    createClone() {
        let clone = new polyline();
        super.createClone(clone);
        clone.line.remove();
        clone.minX = this.minX;
        clone.minY = this.minY;
        clone.maxX = this.maxX;
        clone.maxY = this.maxY;
        clone.cPoint = this.cPoint;
        clone.angle = this.angle;
        clone.newAngle = this.newAngle;
        clone.transform = this.transform;
        clone.svgElement.setAttribute('transform', this.transform);
        clone.path = "";
        clone.pathCoords = [];
        for (let i = 0; i < this.pathCoords.length; i++) {
            clone.pathCoords[i] = {
                x: 0,
                y: 0
            }
            clone.pathCoords[i].x = this.pathCoords[i].x;
            clone.pathCoords[i].y = this.pathCoords[i].y;
        }
        clone.updateFrameAndPoints();
        return clone;
    }

    addParameters() {
        pLine_panel.style.display = "flex";
    }
    updateParameters() {
        pLineX.value = this.minX;
        pLineY.value = this.minY;
        angleInput.value = this.angle * 180.0 / Math.PI;
    }
    removeParameters() {
        pLine_panel.style.display = "none";
    }
    updateLine(current) {
        this.line.updateAttributes(current);
        if ((curX - this.x0) ** 2 + (curY - this.y0) ** 2 <= pointRadius ** 2 && this.pointsArray.length > 1) {
            this.pointsArray[0].setPointAttribute('fill', "red");
        } else {
            this.pointsArray[0].setPointAttribute('fill', "blue");
        }
    }
    updateAttributes() {
        const x = Number(this.line.getElementAttribute('x2')),
            y = Number(this.line.getElementAttribute('y2'));
        if ((curX - this.x0) ** 2 + (curY - this.y0) ** 2 <= pointRadius ** 2 && this.pointsArray.length > 1) {
            this.complete();
            return;
        }
        this.minX = Math.min(this.minX, x);
        this.minY = Math.min(this.minY, y);
        this.maxX = Math.max(this.maxX, x);
        this.maxY = Math.max(this.maxY, y);
        this.cPoint = {
            x: this.minX + (this.maxX - this.minX) / 2,
            y: this.minY + (this.maxY - this.minY) / 2
        };
        if (x != this.x0) {
            this.pathCoords.push({
                x: x,
                y: y
            });
            this.path += " " + x + "," + y;
            this.svgElement.setAttribute('points', this.path);
            this.line.remove();
            this.line = new line(x, y, curX, curY, false);
            this.pointsArray.push(new point(x, y, this, {
                action: "polyline",
                attr: this.pathCoords.length - 1
            }));
        }
    }
    updateFrameAndPoints(dx = 0, dy = 0, minX = this.minX, minY = this.minY, maxX = this.maxX, maxY = this.maxY, transform = this.transform) {
        //включает обновление атрибута
        for (let i = 0; i < this.pathCoords.length; i++) {
            let x = this.pathCoords[i].x + dx,
                y = this.pathCoords[i].y + dy;
            if (i == 0) this.path = x + "," + y;
            else this.path += " " + x + "," + y;
            this.pointsArray[i].update(x, y, transform);
            this.pointsArray[i].type.attr = i;
        }
        if (this.isCompleted)
            this.pointsArray[this.pointsArray.length - 1].update(minX + (maxX - minX) / 2, minY + (maxY - minY) / 2 - 20, transform);
        let x = this.pathCoords[0].x + dx,
            y = this.pathCoords[0].y + dy;
        this.path += " " + x + "," + y;
        this.frameArray[0].update(this.path, transform);
        this.svgElement.setAttribute('points', this.path);
    }
    //MOVE
    move(dx = curX - this.start.x, dy = curY - this.start.y) {
        let new_dx = getRotateCoords(dx, dy, this.angle).x,
            new_dy = getRotateCoords(dx, dy, this.angle).y;
        this.updateFrameAndPoints(new_dx, new_dy, this.minX + new_dx, this.minY + new_dy, this.maxX + new_dx, this.maxY + new_dy, this.transform);
    }
    stopMoving(dx = curX - this.start.x, dy = curY - this.start.y) {
        this.x0 += dx;
        this.y0 += dy;
        this.minX += dx;
        this.minY += dy;
        this.maxX += dx;
        this.maxY += dy;
        this.cPoint = {
            x: this.minX + (this.maxX - this.minX) / 2,
            y: this.minY + (this.maxY - this.minY) / 2
        }
        for (let i = 0; i < this.pathCoords.length; i++) {
            this.pathCoords[i].x += dx;
            this.pathCoords[i].y += dy;
        }
        this.transform = 'rotate(' + this.angle * 180.0 / Math.PI + ' ' + this.cPoint.x + ' ' + this.cPoint.y + ')';
        this.svgElement.setAttribute('transform', this.transform);
        this.updateFrameAndPoints();
    }
    moveTo(x, y) {
        let dx = x + pointRadius - this.minX,
            dy = y + pointRadius - this.minY;
        this.move(dx, dy);
        this.stopMoving(dx, dy);
        this.updateParameters();
    }
    getCornerCoords() {
        return {
            x: this.minX - pointRadius,
            y: this.minY - pointRadius
        }
    }
    deletePoint(ind) {
        if (this.pathCoords.length == 2) deleteFunc(); //actions.js
        else {
            this.pointsArray[ind].remove();
            this.pointsArray.splice(ind, 1);
            this.pathCoords.splice(ind, 1);
            this.updateFrameAndPoints();
        }
    }
    //RESIZE
    resize() {
        let new_curX = this.getNewCoords(curX, curY, 2 * Math.PI - this.angle).x,
            new_curY = this.getNewCoords(curX, curY, 2 * Math.PI - this.angle).y;
        this.pathCoords[currentPointTypeAttr].x = new_curX;
        this.pathCoords[currentPointTypeAttr].y = new_curY;
        this.minX = Math.min(this.minX, new_curX);
        this.minY = Math.min(this.minY, new_curY);
        this.maxX = Math.max(this.maxX, new_curX);
        this.maxY = Math.max(this.maxY, new_curY);
        this.updateFrameAndPoints();
    }
    stopResize() {
        this.cPoint = {
            x: this.minX + (this.maxX - this.minX) / 2,
            y: this.minY + (this.maxY - this.minY) / 2
        };
        this.transform = 'rotate(' + this.angle * 180.0 / Math.PI + ' ' + this.cPoint.x + ' ' + this.cPoint.y + ')';
        this.svgElement.setAttribute('transform', this.transform);
        this.updateFrameAndPoints();
    }
    getResizeAttrs(ind = currentPointTypeAttr) {
        return [
            this.pathCoords[ind].x,
            this.pathCoords[ind].y,
            ind
        ]
    }
    setResizeAttrs(attrs) {
        this.pathCoords[attrs[2]].x = attrs[0];
        this.pathCoords[attrs[2]].y = attrs[1];
        this.minX = Math.min(this.minX, attrs[0]);
        this.minY = Math.min(this.minY, attrs[1]);
        this.maxX = Math.max(this.maxX, attrs[0]);
        this.maxY = Math.max(this.maxY, attrs[1]);
        this.stopResize();
    }
    //ROTATE
    startRotating() {
        this.rPoint = {
            x: this.getNewCoords(this.minX + (this.maxX - this.minX) / 2, this.minY + (this.maxY - this.minY) / 2 - 20, this.angle).x,
            y: this.getNewCoords(this.minX + (this.maxX - this.minX) / 2, this.minY + (this.maxY - this.minY) / 2 - 20, this.angle).y
        }
    }
    rotate(angle = this.angle) {
        let firstSide = Math.sqrt(Math.pow(Math.abs(this.rPoint.x - this.cPoint.x), 2) + Math.pow(Math.abs(this.rPoint.y - this.cPoint.y), 2)),
            secondSide = Math.sqrt(Math.pow(Math.abs(curX - this.cPoint.x), 2) + Math.pow(Math.abs(curY - this.cPoint.y), 2)),
            thirdSide = (Math.sqrt(Math.pow(Math.abs(curX - this.rPoint.x), 2) + Math.pow(Math.abs(curY - this.rPoint.y), 2))),
            angleCos = (Math.pow(firstSide, 2) + Math.pow(secondSide, 2) - Math.pow(thirdSide, 2)) / (2 * firstSide * secondSide),
            newAngle;
        if (secondSide == 0) newAngle = this.angle;
        else newAngle = getRotateCoords(curX, curY, angle).x >= getRotateCoords(this.cPoint.x, this.cPoint.y, angle).x ?
            Math.acos(angleCos) + angle : 2 * Math.PI - Math.acos(angleCos) + angle;
        this.transform = 'rotate(' + newAngle * 180.0 / Math.PI + ' ' + this.cPoint.x + ' ' + this.cPoint.y + ')';
        this.svgElement.setAttribute('transform', this.transform);
        this.updateFrameAndPoints();
    }
    stopRotating() {
        let argss = this.transform.split('(')[1],
            args = argss.split(')')[0],
            newAngle = args.split(' ')[0] * Math.PI / 180.0;
        this.angle = newAngle;
        this.angle = this.angle > 2 * Math.PI ? this.angle - 2 * Math.PI : this.angle;
        this.updateFrameAndPoints();
    }
    rotateTo(newAngle) {
        this.transform = 'rotate(' + newAngle * 180.0 / Math.PI + ' ' + this.cPoint.x + ' ' + this.cPoint.y + ')';
        this.svgElement.setAttribute('transform', this.transform);
        this.angle = newAngle;
        this.angle = this.angle > 2 * Math.PI ? this.angle - 2 * Math.PI : this.angle;
        this.updateFrameAndPoints();
        this.updateParameters();
    }
    getNewCoords(x = this.x0, y = this.y0, angle = this.angle) {
        return {
            x: (x - this.cPoint.x) * Math.cos(angle) - (y - this.cPoint.y) * Math.sin(angle) + this.cPoint.x,
            y: (x - this.cPoint.x) * Math.sin(angle) + (y - this.cPoint.y) * Math.cos(angle) + this.cPoint.y
        }
    }
    complete() {
        if (!polylineIsCompleted) {
            this.line.remove();
            this.pointsArray[0].setPointAttribute('fill', "white");
            this.pointsArray.push(new point(this.minX + (this.maxX - this.minX) / 2, this.minY + (this.maxY - this.minY) / 2 - 20, this, {
                action: "rotate",
                attr: "rotate"
            }));
            this.updateFrameAndPoints();
            polylineIsCompleted = true;
            super.complete(this.path != this.x0 + "," + this.y0 + " " + this.x0 + "," + this.y0);
        }
    }
}