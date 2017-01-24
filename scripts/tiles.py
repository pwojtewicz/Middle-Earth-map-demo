# Leaflet.js map tiles creator
# By Pit GM
# Script requires ImageMagick toolkit from version 6.2.4 and up

from subprocess import call, check_output, Popen
from math import ceil, floor
import os
import sys

if len(sys.argv) < 2:
    print "Usage: tiles FILENAME"
    sys.exit()
else:
    input_filename = sys.argv[1]
    try:
        with open(input_filename):
            print "Accessing " + input_filename
    except IOError:
        print "Can't access " + input_filename
        sys.exit()
    
tile_width = 256 # 256px is the default tile size for leaflet.js
tile_height = 256
image_width = 0
image_height = 0
total_tiles = 0
current_tile_width = 0
current_tile_height = 0
row = 0
column = 0

print "Cropping image to " + str(tile_width) + "x" + str(tile_height) + "px tiles..."
try:
    devnull = open(os.devnull)
    Popen('convert', stdout = devnull, stderr = devnull).communicate()
except OSError as e:
    if e.errno == os.errno.ENOENT:
        print "Can't access imagemagick library"
        sys.exit()

# using ImageMagick slice the image to 256x256px tiles. Append ordinal to the filename        
call("convert -quality 90 -crop " + str(tile_width) + "x" + str(tile_height) + " +repage " + input_filename + " tmp_tile_%d.png", shell = True)

list_dir = []
list_dir = os.listdir(".")

# get image dimensions to calculate number of rows and columns for the tiles
image_width = check_output("identify -format %w " + input_filename)
image_height = check_output("identify -format %h " + input_filename)

number_of_columns = ceil(float(image_width) / tile_width)

# count number of tiles
for file in list_dir:
    if file.startswith("tmp_tile_") and file.endswith(".png"):
        total_tiles += 1

# loop for all tiles
# 1) check tile's dimensions, and if necessary, pad it with background color
# 2) rename tile from ordinal number to x and y positions on a tile grid
for n in range(0, total_tiles):
    source_filename = "tmp_tile_%d.png" % n

    current_tile_width = check_output("identify -format %w " + source_filename)
    current_tile_height = check_output("identify -format %h " + source_filename)

    # AD 1) If an image dimensions divided by 256 leave a remainder, the last vertical and/or horizontal tiles 
    # might not have required 256x256px dimensions. That would cause Leaflet.js to stretch them to the
    # desired size, making a nasty looking effect. Hence the tile is checked for dimensions, and if
    # they are smaller than desired width and/or height, it is padded with background color
    if int(current_tile_width) < tile_width or int(current_tile_height) < tile_height:
        print "%s's size is to small. Padding %s" % (source_filename, source_filename)
        call("convert " + source_filename + " -extent " + str(tile_width) + "x" + str(tile_height) + " " + source_filename, shell=True)
    
    # AD 2) Tile is renamed so that Leaflet.js can access it by x and y coordinatesa
    target_filename = "tile_%d_%d.png" % (column, row)
    print "Renaming %s to %s" % (source_filename, target_filename)
    try:
        os.remove(target_filename)
    except:
        pass
            
    os.rename(source_filename, target_filename)

    try:
        call("optipng " + target_filename, shell = True)
    except:
        pass
        
    column += 1
    if column >= number_of_columns:
        column = 0
        row += 1
        
print "Done generating tiles from %s" % input_filename