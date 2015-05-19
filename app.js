/**
 * Created by Александр on 19.05.2015.
 */
$(function() {
    var toRgbObject = function(hexColor) {
        hexColor = hexColor.replace('#', '').split(/(\w{2})/i);
        var rHex = hexColor[1],
            gHex = hexColor[3],
            bHex = hexColor[5];
        return {
            r: (parseInt(rHex, 16) / 255).toFixed(2),
            g: (parseInt(gHex, 16) / 255).toFixed(2),
            b: (parseInt(bHex, 16) / 255).toFixed(2)
        }
    };

    var createCtlArray = function(numHorizontal, numVertical) {
        var resultString = 'GLfloat ctlarray[' + numHorizontal + '][' + numVertical + '][4] = {\n',
            arrRows = [];
        var xCoord = 0.5, xSign = 1, yCoord = 0.0, zCoord = -0.5;
        if (numHorizontal >= numVertical) {
            for (var i = 0; i < numHorizontal; ++i) {
                for (var j = 0; j < numVertical; ++j) {
                    if (numVertical == 2) {
                        arrRows.push('\t' + xCoord.toFixed(2).toString() + ', ' + yCoord.toFixed(2).toString() + ', ' + zCoord.toFixed(2).toString() + ', 1.0,');
                        zCoord += 0.5;
                    } else {
                        arrRows.push('\t' + xCoord.toFixed(2).toString() + ', ' + yCoord.toFixed(2).toString() + ', ' + zCoord.toFixed(2).toString() + ', 1.0,');
                        xCoord *= -1;
                        zCoord += 0.5;
                    }
                }
                arrRows.push('');
                xCoord *= -1;
                yCoord += 0.1;
                zCoord = -0.5;
                if (xCoord < 0 && numVertical > numHorizontal) {
                    xCoord = 0.5;
                }
            }
        } else {
            xCoord = -0.5;
            yCoord = -0.3;
            zCoord = 0.0;
            for (var i = 0; i < numHorizontal; ++i) {
                for (var j = 0; j < numVertical; ++j) {
                    if (numHorizontal == 2) {
                        arrRows.push('\t' + xCoord.toFixed(2).toString() + ', ' + yCoord.toFixed(2).toString() + ', ' + zCoord.toFixed(2).toString() + ', 1.0,');
                        yCoord *= -1;
                        zCoord += 0.1;
                    } else {
                        alert("С сожалению, для случая, когда количество вертикальных точек больше двух и больше количества горизонтальных, нет решения.");
                        return;
                    }
                }
                arrRows.push('');
                xCoord *= -1;
                yCoord = -0.3;
                zCoord = 0.0;
            }
        }
        resultString += arrRows.join('\n') + '};';
        return resultString;
    };

    var fields = {
        horizontalVertex: $('#horizontalVertex'),
        verticalVertex: $('#verticalVertex'),
        horizontalRank: $('#horizontalRank'),
        verticalRank: $('#verticalRank'),
        colorSurface: $('#colorSurface'),
        colorBackground: $('#colorBackground'),
        generateAction: $('#generateAction'),
        resultArea: $('#resultArea')
    };
    fields.generateAction.on('click', function() {
        var values = {
            horizontalVertex: parseInt(fields.horizontalVertex.val()),
            verticalVertex: parseInt(fields.verticalVertex.val()),
            horizontalRank: parseInt(fields.horizontalRank.val()),
            verticalRank: parseInt(fields.verticalRank.val()),
            colorSurface: toRgbObject(fields.colorSurface.val()),
            colorBackground: toRgbObject(fields.colorBackground.val())
        };
        if (values.horizontalRank > values.horizontalVertex || values.verticalRank > values.verticalVertex) {
            if (!confirm("Размерность превышает количество точек. Сгенерированный код работать не будет. Все равно сгенерировать?")) {
                return;
            }
        }
        var ctlArrayString = createCtlArray(values.horizontalVertex, values.verticalVertex);

        var resultCode = '#include <stdlib.h>\n\
#include <GL/glut.h>\n\
#include <vector>\n\
#include <cstdio>\n\
\n\
        GLUnurbsObj* theNurb;\n\
\n' + ctlArrayString + '\n\
\n\
    void insertKnots(int n, int k, GLfloat *knots, int &size) {\n\
        size = n + k;\n\
        int temp = 0;\n\
        for (int i = 0; i < size; ++i) {\n\
            if (i >= k && size - i >= k) {\n\
                ++temp;\n\
            }\n\
            knots[i] = temp;\n\
        }\n\
    }\n\
\n\
    void init() {\n\
        glClearColor(' + values.colorBackground.r + ', ' + values.colorBackground.g + ', ' + values.colorBackground.b + ', 1);\n\
        theNurb = gluNewNurbsRenderer();\n\
        glEnable(GL_DEPTH_TEST);\n\
        glEnable(GL_COLOR_MATERIAL);\n\
        glEnable(GL_LIGHTING);\n\
        glEnable(GL_LIGHT0);\n\
        gluNurbsProperty(theNurb, GLU_SAMPLING_TOLERANCE, 25.0);\n\
        glShadeModel(GL_SMOOTH);\n\
        glLightModeli(GL_LIGHT_MODEL_TWO_SIDE, 1);\n\
    }\n\
\n\
    void Display() {\n\
        int knotSizeHoriz, knotSizeVert,\n\
            numVertexHoriz = ' + values.horizontalVertex + ',\n\
            numVertexVert = ' + values.verticalVertex + ',\n\
            rankHoriz = ' + values.horizontalRank + ',\n\
            rankVert = ' + values.verticalRank + ';\n\
\n\
        GLfloat knotHoriz[] = {\n\
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,\n\
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0\n\
        };\n\
        insertKnots(numVertexHoriz, rankHoriz, knotHoriz, knotSizeHoriz);\n\
\n\
        GLfloat knotVert[] = {\n\
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,\n\
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0\n\
        };\n\
        insertKnots(numVertexVert, rankVert, knotVert, knotSizeVert);\n\
\n\
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);\n\
\n\
        glRotatef(0.5, 1.0, -1.0, 1.0);\n\
        glColor3f(' + values.colorSurface.r + ', ' + values.colorSurface.g + ', ' + values.colorSurface.b + ');\n\
        gluBeginSurface(theNurb);\n\
        gluNurbsSurface(theNurb, knotSizeHoriz, knotHoriz, knotSizeVert, knotVert, numVertexVert * 4, 4, &ctlarray[0][0][0], rankHoriz, rankVert, GL_MAP2_VERTEX_4);\n\
        gluEndSurface(theNurb);\n\
        glutPostRedisplay();\n\
        glutSwapBuffers();\n\
    }\n\
\n\
    void main() {\n\
        glutInitDisplayMode(GLUT_RGBA | GLUT_DOUBLE | GLUT_DEPTH);\n\
        glutInitWindowSize(700, 700);\n\
        glutInitWindowPosition(100, 100);\n\
        glutCreateWindow(" ");\n\
        init();\n\
        glutDisplayFunc(Display);\n\
        glutMainLoop();\n\
    }';
    fields.resultArea.text(resultCode);
    });
});