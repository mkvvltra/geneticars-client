var LibraryWebGL = {
    JS_WebGL_InitContextAttributes: function(attributes) 
    {
        // We want alpha in the back buffer so that we match expected Unity output.
        // But the browsers will use alpha to blend with the web page, so we have to
        // make sure we clear it before blitting.
        {{{ makeSetValue('attributes', C_STRUCTS.EmscriptenWebGLContextAttributes.alpha, 1, 'i32') }}};
        {{{ makeSetValue('attributes', C_STRUCTS.EmscriptenWebGLContextAttributes.depth, 1, 'i32') }}};
        {{{ makeSetValue('attributes', C_STRUCTS.EmscriptenWebGLContextAttributes.stencil, 1, 'i32') }}};
        {{{ makeSetValue('attributes', C_STRUCTS.EmscriptenWebGLContextAttributes.antialias, 0, 'i32') }}};
        {{{ makeSetValue('attributes', C_STRUCTS.EmscriptenWebGLContextAttributes.premultipliedAlpha, 1, 'i32') }}};
        {{{ makeSetValue('attributes', C_STRUCTS.EmscriptenWebGLContextAttributes.preserveDrawingBuffer, 'Module.webglContextAttributes.preserveDrawingBuffer', 'i32') }}};
        {{{ makeSetValue('attributes', C_STRUCTS.EmscriptenWebGLContextAttributes.preferLowPowerToHighPerformance, 0, 'i32') }}};
        {{{ makeSetValue('attributes', C_STRUCTS.EmscriptenWebGLContextAttributes.failIfMajorPerformanceCaveat, 0, 'i32') }}};
        {{{ makeSetValue('attributes', C_STRUCTS.EmscriptenWebGLContextAttributes.majorVersion, 1, 'i32') }}};
        {{{ makeSetValue('attributes', C_STRUCTS.EmscriptenWebGLContextAttributes.minorVersion, 0, 'i32') }}};
        {{{ makeSetValue('attributes', C_STRUCTS.EmscriptenWebGLContextAttributes.enableExtensionsByDefault, 1, 'i32') }}};
        {{{ makeSetValue('attributes', C_STRUCTS.EmscriptenWebGLContextAttributes.explicitSwapControl, 0, 'i32') }}};

        return 0;
    }
};

mergeInto(LibraryManager.library, LibraryWebGL);
