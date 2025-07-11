window.onload = function () {
    Calculator.initCache();
    Calculator.initListeners();
};

var Calculator = (function () {
    var cal = {
        // Calculator key codes
        keyCodes: {
            0: '0',
            1: '1',
            2: '2',
            3: '3',
            4: '4',
            5: '5',
            6: '6',
            7: '7',
            8: '8',
            9: '9',
            10: '.',
            11: '±',
            12: '=',
            13: '+',
            14: '-',
            15: '*',
            16: '/',
            17: '%',
            18: '√',
            19: 'x2',
            20: '1/x',
            21: '(',
            22: ')',
            23: 'yroot',
            24: 'n!',
            25: 'Exp',
            26: '^',
            27: 'sin',
            28: 'cos',
            29: 'tan',
            30: 'powten',
            31: 'log',
            32: 'sinh',
            33: 'cosh',
            34: 'tanh',
            35: 'π',
            36: '↑',
            37: 'CE',
            38: 'C',
            39: 'Back',
            // The following keys are specific to programmer mode
            40: 'A',
            41: 'B',
            42: 'C',
            43: 'D',
            44: 'E',
            45: 'F',
            46: '&',
            47: '|',
            48: '~'
        },
         // Mapping for display operators
        operatorFacade: {
            13: '+',
            14: '-',
            15: '×',
            16: '÷',
            17: '%',
            23: 'yroot',
            26: '^',
            46: '&',
            47: '|'
        },
        // Current calculator type: 1 --> Standard, 2 --> Scientific, 3 --> Programmer, default is Standard
        type: 1,
        typePrefix: {
            1: "std-",
            2: "sci-",
            3: "pro-"
        },
        // Record whether event listeners for each calculator type have been bound, key: type value, value: default standard is true (already loaded)
        hasInited: {
            1: true,
            2: false,
            3: false
        },
        cache: {
            // Input display element
            showInput: null,
            // Previous step calculation display area
            preStep: null,
             // Display spans for four base systems, only valid in programmer mode
            scaleSpans: null
        },
        /**
         * Get the content of cache.showInput
         * @return String
         */
        getShowInput: function () {
            return cal.cache.showInput.innerHTML;
        },
        /**
         * Set the value of showInput
         * @param value
         */
        setShowInput: function (value) {
            cal.cache.showInput.innerHTML = value;
        },
        /**
         * Get the content of cache.preStep
         * @return String
         */
        getPreStep: function () {
            return cal.cache.preStep.innerHTML;
        },
        setPreStep: function (value) {
            cal.cache.preStep.innerHTML = value;
        },
        operandStack: [],
        operatorStack: [],
        isPreInputBinaryOperator: false,
        isPreInputUnaryOperator: false,
        isPreInputEquals: false,
        //If true, the next number input needs to override showInput rather than append
        // Previous calculation result (=)
        preResult: 0,
        // Current number base (only valid in programmer mode), default is decimal (DEC)
        currentScale: 10,
        isOverride: false,
        //Integer validation
        intPattern: /^-?\d+$/,
        // Decimal validation
        floatPattern: /^-?\d+\.\d+$/,
        // Scientific notation validation
        scientificPattern: /^\d+\.\d+e(\+|-)\d+$/,
        // Validate hexadecimal numbers
        hexPattern: /^[0-9A-F]+$/,
        // Helper for determining operator precedence
        operatorPriority: {
            ")": 0,
            "|": 1,
            "&": 2,
            "+": 3,
            "-": 3,
            "*": 4,
            "%": 4,
            "/": 4,
            "^": 5,
            "yroot": 5,
            "(": 6
        },
        constants: {
            mouseHoverColor: "#e3e7ed",
            firstMouseOutColor: "#e2e6ea",
            mouseOutColor: "#f5f7fa"
        },
        /**
         * Initialize cache object (cal.cache)
         */
        initCache: function () {
            var prefix = cal.typePrefix[cal.type];
            cal.cache.showInput = document.getElementById(prefix + "show-input");
            cal.cache.preStep = document.getElementById(prefix + "pre-step");
            if (cal.type == 3) {
                cal.cache.scaleSpans = document.getElementById("pro-scales").getElementsByTagName("span");
            }
        },
        // Various event listener functions
        listeners: {
            /**
             * Mouse hover color effect on buttons
             */
            mouseHoverListener: function (e) {
                var event = e || window.event;
                // Don't override specific colors for operator and equals buttons
                if (event.currentTarget.classList.contains('operator') || 
                    event.currentTarget.classList.contains('equals')) {
                    return;
                }
                event.currentTarget.style.backgroundColor = cal.constants.mouseHoverColor;
            },
            /**
             * Color effect when mouse moves out from top row symbols
             */
            firstMouseOutListener: function (e) {
                var event = e || window.event;
                // Don't override specific colors for operator and equals buttons
                if (event.currentTarget.classList.contains('operator') || 
                    event.currentTarget.classList.contains('equals')) {
                    return;
                }
                event.currentTarget.style.backgroundColor = cal.constants.firstMouseOutColor;
            },
            /**
             * Color effect when mouse moves out from lower rows of numbers and symbols
             */
            mouseOutListener: function (e) {
                var event = e || window.event;
                // Don't reset background for operator and equals buttons
                if (event.currentTarget.classList.contains('operator') || 
                    event.currentTarget.classList.contains('equals')) {
                    return;
                }
                event.currentTarget.style.backgroundColor = cal.constants.mouseOutColor;
            },
            /**
             * Button press event listener
             */
            keyPressListener: function (e) {
                var event = e || window.event;
                cal.handleKey(event.currentTarget.value);
            },
            /**
             * Show/hide calculator type selection bar
             */
            toggleTypeBarListener: function () {
                var bar = document.getElementById(cal.typePrefix[cal.type] + "type-bar");
                if (bar.style.display === "block") {
                    bar.style.display = "none";
                } else {
                    bar.style.display = "block";
                }
            },
            /**
             * Calculator type switch listener
             */
            switchTypeListener: function (e) {
                var event = e || window.event;
                cal.switchType(parseInt(event.currentTarget.value));
            },
            /**
             * Switch number base (programmer mode only)
             */
            switchScaleListener: function (e) {
                var event = e || window.event;
                var scales = document.getElementById("pro-scales").getElementsByTagName("div"),
                    scale = parseInt(event.currentTarget.getAttribute("scale")),
                    oldScale = cal.currentScale;
                // Switch selected style
                for (var i = 0, l = scales.length; i < l; ++i) {
                    scales[i].removeAttribute("class");
                }
                event.currentTarget.setAttribute("class", "scale-active");
                var lis, btns;
                if (scale === 16) {
                    // Handle top 6 hexadecimal numbers
                    cal.listeners._initFirstRowListeners();
                    if (oldScale < 10) {
                        cal.listeners._initSecondRowListeners();
                    }
                } else if (scale === 10) {
                    if (oldScale === 16) {
                        lis = document.getElementById("pro-top-symbol").getElementsByTagName("li");
                        cal.disableButtons(lis, cal.listeners.firstMouseOutListener);
                    } else {
                        cal.listeners._initSecondRowListeners();
                    }
                } else if (scale === 8) {
                    if (oldScale > 8) {
                        lis = document.getElementById("pro-top-symbol").getElementsByTagName("li");
                        cal.disableButtons(lis, cal.listeners.firstMouseOutListener);
                        // Disable 8 and 9
                        btns = cal.getElementsByAttribute("li", "oct-disable", document.getElementById("pro-num-symbol"));
                        cal.disableButtons(btns, cal.listeners.mouseOutListener);
                    } else {
                        cal.listeners._initSecondRowListeners();
                    }
                } else if (scale === 2) {
                    if (oldScale === 16) {
                        lis = document.getElementById("pro-top-symbol").getElementsByTagName("li");
                        cal.disableButtons(lis, cal.listeners.firstMouseOutListener);
                    }
                    // Disable 2-9
                    btns = cal.getElementsByAttribute("li", "bin-disable", document.getElementById("pro-num-symbol"));
                    cal.disableButtons(btns, cal.listeners.mouseOutListener);
                }
                cal.currentScale = scale;
            },
            /**
             * Initialize first row operators event listeners
             * @private
             */
            _initFirstRowListeners: function () {
                var lis = document.getElementById(cal.typePrefix[cal.type] + "top-symbol").getElementsByTagName("li");
                cal.rebuildButtons(lis, cal.listeners.firstMouseOutListener);
            },
            /**
             * Initialize second row operators event listeners
             * @private
             */
            _initSecondRowListeners: function () {
                var lis = document.getElementById(cal.typePrefix[cal.type] + "num-symbol").getElementsByTagName("li");
                cal.rebuildButtons(lis, cal.listeners.mouseOutListener);
                if (cal.type === 3) {
                    // Decimal point is disabled in programmer mode
                    cal.disableButtons([document.getElementById("pro-point")], cal.listeners.mouseOutListener);
                }
            }
        },
        //Initialize event listeners
        initListeners: function () {
            var prefix = cal.typePrefix[cal.type];
            if (cal.type < 3) {
                cal.listeners._initFirstRowListeners();
            }
            // Set bottom row numbers and arithmetic event listeners
            cal.listeners._initSecondRowListeners();
            // Show/hide calculator type selection sidebar
            cal.addEvent(document.getElementById(prefix + "show-bar"), "click", cal.listeners.toggleTypeBarListener);
            // Bind type switching events for the li elements in the sidebar
            var bar = document.getElementById(prefix + "type-bar");
            lis = bar.getElementsByTagName("li");
            var li;
            for (var i = 0, l = lis.length; i < l; ++i) {
                li = lis[i];
                // Only non-current types need to bind events
                if (li.className !== "active") {
                    cal.addEvent(li, "click", cal.listeners.switchTypeListener);
                }
            }
            // Load programmer mode specific
            if (cal.type === 3) {
                var scales = document.getElementById("pro-scales").getElementsByTagName("div"),
                    scale;
                for (i = 0, l = scales.length; i < l; ++i) {
                    scale = scales[i];
                    cal.addEvent(scale, "click", cal.listeners.switchScaleListener);
                }
            }
        },
        /**
         * Respond to key press events
         * @param value value The value of the key (its keyCode)
         */
        handleKey: function (value) {
            var keyCode = parseInt(value);
            // If it's a number or decimal point, display it directly
            if (keyCode < 11 || (keyCode > 39 && keyCode < 46)) {
                cal.showInput(cal.keyCodes[keyCode]);
                if (cal.type === 3) {
                    // If programmer mode, need to synchronize display of 4 number bases
                    cal.showScales(cal.getShowInput());
                }
            } else {
                switch (keyCode) {
                    // Plus/minus sign
                    case 11:
                        cal.unaryOperate(function (oldValue) {
                            oldValue += "";
                            if (oldValue === "0") {
                                return [oldValue];
                            }
                            if (oldValue.charAt(0) === '-') {
                                return [oldValue.substring(1)];
                            } else {
                                return ["-" + oldValue];
                            }
                        });
                        break;
                        // Square root
                    case 18:
                        cal.unaryOperate(function (si) {
                            return [Math.sqrt(si), "sqrt"];
                        });
                        break;
                        // Square
                    case 19:
                        cal.unaryOperate(function (si) {
                            return [Math.pow(si, 2), "sqr"];
                        });
                        break;
                        // Reciprocal
                    case 20:
                        cal.unaryOperate(function (si) {
                            return [si === 0 ? "0不能作为被除数" : 1 / si, "1/"];
                        });
                        break;
                        // Factorial
                    case 24:
                        cal.unaryOperate(function (si) {
                            if (si < 0) {
                                si = (0 - si);
                            }
                            if (cal.isFloat(si + "")) {
                                si = Math.floor(si);
                            }
                            return [cal.fact(si), "fact"];
                        });
                        break;
                        // Exp - Convert to scientific notation
                    case 25:
                        cal.unaryOperate(function (si) {
                            return [si.toExponential(7)];
                        });
                        break;
                        // sin
                    case 27:
                        cal.unaryOperate(function (si) {
                            return [Math.sin(si), "sin"];
                        });
                        break;
                        // cos
                    case 28:
                        cal.unaryOperate(function (si) {
                            return [Math.cos(si), "cos"];
                        });
                        break;
                        // tan
                    case 29:
                        cal.unaryOperate(function (si) {
                            return [Math.tan(si), "tan"];
                        });
                        break;
                        // 10 to the power of x
                    case 30:
                        cal.unaryOperate(function (si) {
                            return [Math.pow(10, si), "powten"];
                        });
                        break;
                        //log
                    case 31:
                        cal.unaryOperate(function (si) {
                            // the logarithm of e
                            return [Math.log10(si), "log"];
                        });
                        break;
                        //sinh
                    case 32:
                        cal.unaryOperate(function (si) {
                            return [Math.sinh(si), "sinh"];
                        });
                        break;
                        //cosh
                    case 33:
                        cal.unaryOperate(function (si) {
                            return [Math.cosh(si), "cosh"];
                        });
                        break;
                        //tanh
                    case 34:
                        cal.unaryOperate(function (si) {
                            return [Math.tanh(si), "tanh"];
                        });
                        break;
                        //π
                    case 35:
                        cal.unaryOperate(function (si) {
                            return [Math.PI];
                        });
                        break;
                        // Bitwise NOT (~)
                    case 48:
                        cal.unaryOperate(function (si) {
                            var result = eval("~" + si);
                            // Display all four base values
                            cal.showScales(result);
                            return [result];
                        });
                        break;
                        // Binary operators start
                        // Addition, subtraction, multiplication, division, modulo - simple operations, can use eval directly
                    case 13:
                    case 14:
                    case 15:
                    case 16:
                    case 17:
                        // x to the power of y
                    case 26:
                        // Any root
                    case 23:
                        //And Or
                    case 46:
                    case 47:
                        if (cal.isPreInputBinaryOperator) {
                            break;
                        }
                        cal.isPreInputBinaryOperator = true;
                        cal.isOverride = true;
                        cal.binaryOperate(cal.keyCodes[keyCode], cal.operatorFacade[keyCode]);
                        break;
                    case 12:
                        cal.calculate();
                        break;
                        // ce
                    case 37:
                        cal.ce();
                        break;
                        // c
                    case 38:
                        cal.clear();
                        break;
                        // back
                    case 39:
                        cal.back();
                        break;
                        // (
                    case 21:
                        cal.setPreStep(cal.getPreStep() + " (");
                        cal.operatorStack.push("(");
                        break;
                        // )
                    case 22:
                        cal.rightTag();
                        break;
                        // Up arrow, display last calculation result
                    case 36:
                        cal.setShowInput(cal.preResult);
                        break;
                }
            }
        },
        /**
         * Perform unary operation like reciprocal, square
         * @param operation Specific operation callback function
         * It will pass a parameter si to operation, which is the user's current input. The operation function should return an array,
         * the first element is the calculation result, the second element is like sqrt, the second parameter is optional
         */
        unaryOperate: function (operation) {
            var si = cal.getShowInput(),
                result;
            if (cal.isInteger(si)) {
                result = operation(parseInt(si));
            } else if (cal.isFloat(si) || cal.isScientific(si)) {
                result = operation(parseFloat(si));
            }
            if (result != null) {
                cal.setShowInput(cal.checkLength(result[0]));
                if (result.length > 1) {
                    if (!cal.isPreInputUnaryOperator) {
                        cal.setPreStep(cal.getPreStep() + " " + result[1] + "(" + si + ")");
                        cal.isPreInputUnaryOperator = true;
                    } else {
                        var pi = cal.getPreStep();
                        pi = pi.substring(0, pi.lastIndexOf(" "));
                        pi += (" " + result[1] + "(" + si + ")");
                        cal.setPreStep(pi);
                    }
                }
                // Unary operation should override next input
                cal.isOverride = true;
            }
            cal.isPreInputBinaryOperator = false;
        },
        /**
         * Binary operation (+ - * / %)
         * @param operator Operation symbol
         * @param facade Operator facade, used for display in preStep
         */
        binaryOperate: function (operator, facade) {
            // If programmer mode, need to reset scalesSpan
            if (cal.type === 3) {
                cal.resetScales();
            }
            var si = cal.getShowInput(),
                pi = cal.getPreStep();
            if (cal.isNumber(si)) {
                // Push to operand stack
                cal.operandStack.push(si);
                // Setting preStep has three situations: First, the previous step is not a unary operation, then need to set si;
                // Second is a unary operation, since unary operation will set the function expression (like sqrt(100)) to preStep, so no need to set si again
                // Third is if the last character is a right parenthesis, then also no need to set si
                cal.setPreStep(cal.getPreStep() + ((cal.isPreInputUnaryOperator || pi.charAt(pi.length - 1) === ")") ?
                    (" " + facade) : (" " + si + " " + facade)));
                var preOp = cal.operatorStack.pop();
                if (preOp != null) {
                    var op = cal.operatorPriority[operator],
                        pp = cal.operatorPriority[preOp];
                    // If current operator has higher priority, just push to stack without calculation
                    if (op > pp) {
                        cal.operatorStack.push(preOp);
                    }
                    // If both have equal priority and higher than 3 (add/subtract), only need to calculate one step
                    else if (op > 3 && op === pp) {
                        cal.operatorStack.push(preOp);
                        cal.travelStack(1);
                    } else {
                        cal.operatorStack.push(preOp);
                        cal.setShowInput(cal.checkLength(cal.travelStack(null, op)));
                    }
                }
                cal.operatorStack.push(operator);
            }
            cal.isPreInputUnaryOperator = false;
            cal.isPreInputEquals = false;
        },
        /**
         * Calculate final result when = is pressed
         */
        calculate: function () {
            if (!cal.isPreInputEquals) {
                var si = cal.getShowInput(),
                    result;
                if (cal.isNumber(si)) {
                    cal.operandStack.push(si);
                    result = cal.checkLength(cal.travelStack());
                    cal.setShowInput(result);
                    cal.preResult = result;
                    cal.setPreStep("&nbsp;");
                    // Programmer mode needs to display the four base values of calculation result
                    if (cal.type === 3) {
                        cal.showScales(result);
                    }
                    cal.isOverride = true;
                }
                cal._reset();
                cal.isPreInputEquals = true;
            }
        },
        /**
         * Access operation stack, return calculation result
         * @param level Number of calculation levels, if not specified, traverse the entire stack
         * @param minPri Minimum/cutoff priority
         * @return Number
         * @private
         */
        travelStack: function (level, minPri) {
            var op, f, s,
                // result takes stack top of operand stack, to prevent undefined in situations like 9 X (6 +
                result = cal.operandStack[cal.operandStack.length - 1],
                l = level || cal.operatorStack.length,
                p = minPri || 0;
            for (var i = 0; i < l; ++i) {
                op = cal.operatorStack.pop();
                // Stop immediately on encountering minPri or left parenthesis, left parenthesis also needs to be pushed back,
                // since only a right parenthesis can cancel out a left one
                if (cal.operatorPriority[op] < p || op === "(") {
                    cal.operatorStack.push(op);
                    break;
                }
                s = cal.operandStack.pop();
                f = cal.operandStack.pop();
                result = cal._stackHelper(f, s, op);
                cal.operandStack.push(result);
            }
            return result;
        },
        /**
         * Input a right parenthesis
         */
        rightTag: function () {
            var si = cal.getShowInput();
            if (cal.isNumber(si)) {
                cal.setPreStep(cal.getPreStep() + (" " + si + " )"));
                cal.operandStack.push(si);
                // Traverse and calculate operation stack until encountering a left parenthesis
                var op = cal.operatorStack.pop(),
                    f, s, result;
                while (op !== "(" && op != null) {
                    s = cal.operandStack.pop();
                    f = cal.operandStack.pop();
                    result = cal._stackHelper(f, s, op);
                    cal.operandStack.push(result);
                    op = cal.operatorStack.pop();
                }
                // Should directly pop out the parenthesis calculation content, because this result is displayed in showInput,
                // and when executing binary operation again there will be a push operation first, and calculation using = is also based on showInput content
                cal.setShowInput(cal.checkLength(cal.operandStack.pop()));
            }
        },
        /**
         * Helper to perform a stack operation
         * @param f First operand
         * @param s Second operand
         * @param op Operator
         * @return Returns calculation result
         * @private
         */
        _stackHelper: function (f, s, op) {
            var result;
            if (op === "^") {
                result = Math.pow(f, s);
            } else if (op === "yroot") {
                result = Math.pow(f, 1 / s);
            }
            // + - X / % operations
            else {
                // If programmer mode, needs to consider number base issues
                if (cal.type === 3) {
                    var scale = cal.currentScale,
                        fi, si;
                    if (scale === 10) {
                        result = eval(f + op + s);
                    } else if (scale === 16) {
                        fi = parseInt(f, 16);
                        si = parseInt(s, 16);
                        result = eval(fi + op + si).toString(16);
                    } else if (scale === 8) {
                        fi = parseInt(f, 8);
                        si = parseInt(s, 8);
                        result = eval(fi + op + si).toString(8);
                    } else {
                        fi = parseInt(f, 2);
                        si = parseInt(s, 2);
                        result = eval(fi + op + si).toString(2);
                    }
                } else {
                    result = eval(f + op + s);
                }
            }
            return result;
        },
        /**
         * Ensure result length is not greater than 13, if exceeded, display in scientific notation (7 decimal places)
         * @param value Result to check
         */
        checkLength: function (value) {
            var valueStr = value + "";
            if (cal.isFloat(valueStr)) {
                valueStr = valueStr.replace(/0+$/, "");
            }
            return valueStr.length > 12 ? value.toExponential(7) : valueStr;
        },
        //CE
        ce: function () {
            cal.setShowInput("0");
            if (cal.type === 3) {
                cal.resetScales();
            }
        },
        //C
        clear: function () {
            cal.setShowInput("0");
            cal.setPreStep("&nbsp;");
            cal._reset();
            if (cal.type === 3) {
                cal.resetScales();
            }
        },
        /**
         * Clear all four base values
         * @private
         */
        resetScales: function () {
            for (var i = 0; i < 4; i++) {
                cal.cache.scaleSpans[i].innerHTML = "0";
            }
        },
        back: function () {
            var oldValue = cal.cache.showInput.innerText;
            cal.setShowInput(oldValue.length < 2 ? "0" : oldValue.substring(0, oldValue.length - 1));
        },
        /**
         * When calculator is in programmer mode, need to synchronously display values in all four bases
         * @param num Number to display
         */
        showScales: function (num) {
            var result = cal.calculateScales(num),
                spans = cal.cache.scaleSpans;
            for (var i = 0; i < 4; ++i) {
                spans[i].innerHTML = result[i];
            }
        },
        /**
         * Calculate values for all four bases based on current base
         * @param num Value to calculate
         * @return Array With 4 elements, representing hex, decimal, octal, and binary values
         */
        calculateScales: function (num) {
            var scale = cal.currentScale,
                result = [],
                i;
            if (scale === 10) {
                i = parseInt(num);
                result[0] = i.toString(16);
                result[1] = i;
                result[2] = i.toString(8);
                result[3] = i.toString(2);
            } else if (scale === 16) {
                // First convert to decimal, then to other bases
                i = parseInt(num, 16);
                result[0] = num;
                result[1] = i;
                result[2] = i.toString(8);
                result[3] = i.toString(2);
            } else if (scale === 8) {
                i = parseInt(num, 8);
                result[0] = i.toString(16);
                result[1] = i;
                result[2] = num;
                result[3] = i.toString(2);
            } else {
                i = parseInt(num, 2);
                result[0] = i.toString(16);
                result[1] = i;
                result[2] = i.toString(8);
                result[3] = num;
            }
            return result;
        },
        /**
         * Validate if string is a number
         * @param str
         * @return returns true if it is
         */
        isNumber: function (str) {
            return cal.isInteger(str) || cal.isFloat(str) || cal.isScientific(str) || cal.isHex(str);
        },
        /**
         * Validate if is integer
         * @param str
         */
        isInteger: function (str) {
            return str.match(cal.intPattern);
        },
        /**
         * Check if the input is a floating-point number
         * @param str
         */
        isFloat: function (str) {
            return str.match(cal.floatPattern);
        },
        /**
         * Check if the input is in scientific notation
         * @param str
         */
        isScientific: function (str) {
            return str.match(cal.scientificPattern);
        },
        /**
         * Check if the input is a hexadecimal number
         * @param str
         */
        isHex: function (str) {
            return str.match(cal.hexPattern);
        },
        /**
         * Show input value in the display area
         * @param value The content of the button (not the keyCode)
         */
        showInput: function (value) {
            var oldValue = cal.getShowInput();
            var newValue = oldValue;
            if (cal.isOverride) {
                // If overriding, and input is ".", then use "0.x"
                if (value === ".") {
                    newValue = "0.";
                } else {
                    newValue = value;
                }
            } else if (oldValue.length < 13) {
                if (oldValue === "0") {
                    if (value === ".") {
                        newValue = "0.";
                    } else {
                        newValue = value;
                    }
                } else {
                    newValue += value;
                }
            }
            cal.setShowInput(newValue);
            cal.isOverride = false;
            cal.isPreInputBinaryOperator = false;
            cal.isPreInputUnaryOperator = false;
            cal.isPreInputEquals = false;
        },
        /**
         * Switch calculator type
         * @param type int Type to switch to
         */
        switchType: function (type) {
            // Hide the current type's sidebar
            var oldPrefix = cal.typePrefix[cal.type];
            document.getElementById(oldPrefix + "type-bar").style.display = "none";
            // Switch panel
            document.getElementById(oldPrefix + "main").style.display = "none";
            document.getElementById(cal.typePrefix[type] + "main").style.display = "block";
            cal.type = type;
            if (!cal.hasInited[type]) {
                cal.initListeners();
                cal.hasInited[type] = true;
            }
            cal.initCache();
            cal._reset();
        },
        /**
         * Reset calculator state
         * @private
         */
        _reset: function () {
            cal.operandStack = [];
            cal.operatorStack = [];
            cal.isPreInputBinaryOperator = false;
            cal.isPreInputUnaryOperator = false;
            cal.isPreInputEquals = false;
        },
        /**
         * Utility method to add event listener to an element
         * @param element DOM element to attach the event to
         * @param name Event name (without "on")
         * @param handler Event handler function
         */
        addEvent: function (element, name, handler) {
            if (window.addEventListener) {
                element.addEventListener(name, handler);
            } else if (window.attachEvent) {
                element.attachEvent("on" + name, handler);
            }
        },
        /**
         * Utility method to remove specific event listener from an element
         * @param element DOM element to remove the listener from
         * @param name Event name (without "on")
         * @param handler The handler function to remove
         */
        removeEvent: function (element, name, handler) {
            if (window.removeEventListener) {
                element.removeEventListener(name, handler);
            } else if (window.detachEvent) {
                element.detachEvent("on" + name, handler);
            }
        },
        /**
         * Utility method to find elements by attribute (only checks for existence)
         * @param tag Target tag name
         * @param attr Attribute name
         * @param root Optional starting node for search (defaults to document)
         */
        getElementsByAttribute: function (tag, attr, root) {
            var parent = root || document,
                result = [];
            var arr = parent.getElementsByTagName(tag),
                a;
            for (var i = 0, l = arr.length; i < l; ++i) {
                a = arr[i];
                if (a.getAttribute(attr) != null) {
                    //这个写法...
                    result[result.length] = a;
                }
            }
            return result;
        },
        /**
         * Factorial function
         * @param n Operand (integer)
         * @return Factorial of n
         */
        fact: (function () {
            // Cache results
            var cache = [1];

            function factorial(n) {
                var result = cache[n - 1];
                if (result == null) {
                    result = 1;
                    for (var i = 1; i <= n; ++i) {
                        result *= i;
                    }
                    cache[n - 1] = result;
                }
                return result;
            }
            return factorial;
        })(),
        /**
         * Disable buttons (only used in programmer mode)
         * @param lis Collection of buttons
         * @param mouseOutListener Function for mouseout event depending on button position (top/bottom row)
         */
        disableButtons: function (lis, mouseOutListener) {
            var li;
            for (var i = 0, l = lis.length; i < l; ++i) {
                li = lis[i];
                li.setAttribute("class", "disable-btn");
                cal.removeEvent(li, "click", cal.listeners.keyPressListener);
                cal.removeEvent(li, "mouseout", mouseOutListener);
                cal.removeEvent(li, "mouseover", cal.listeners.mouseHoverListener);
            }
        },
        /**
         * Re-enable buttons
         * @param lis Collection of buttons
         * @param mouseOutListener Function for mouseout event depending on button position (top/bottom row)
         */
        rebuildButtons: function (lis, mouseOutListener) {
            var li;
            for (var i = 0, l = lis.length; i < l; ++i) {
                li = lis[i];
                li.removeAttribute("class");
                cal.addEvent(li, "click", cal.listeners.keyPressListener);
                cal.addEvent(li, "mouseout", mouseOutListener);
                cal.addEvent(li, "mouseover", cal.listeners.mouseHoverListener);
            }
        }
    };
    return cal;
})();