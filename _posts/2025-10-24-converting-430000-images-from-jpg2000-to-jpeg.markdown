---
layout: post
title:  "Converting 430.000 images from JPG2000 to JPEG"
date:   2025-10-24
render_with_liquid: false
---
This year, the [Ghent University Library](https://lib.ugent.be) is migrating to a new library services platform. This project includes the migration of some 430.000 images from our digitized heritage collections to this new system. These images are stored in a bespoke image library solution that was used to publish these images via the [IIIF framework](https://iiif.io) via the online catalog. Moving them to the new platform allows us to present them via the [new catalog](https://lib.ugent.be).

The images are derivative copies generated from archival copies which are separately preserved in the library's digital archive. When the derivatives were created, the JPEG2000 format was used because this image format supports [image tiling](https://training.iiif.io/iiif-online-workshop/day-two/fileformats.html) which improves the experience when viewing a large files via a IIIF viewer. However, the new system imposes constraints regarding storage usage. A reduction of the volume data turned into an important milestone. We opted to convert the files from JPEG2000 to JPEG. This was an exercise that I was tasked to complete.

Diving into this challenge, I identified these concerns:

* Perform the conversion reliably within a reasonable time frame. Days, rather than weeks.
* Avoid a reduction of fidelity / image quality as much as possible.
* Store the converted output safely before uploading to the new system in a separate step.

In this blogpost, I describe how I tackled each of these concerns and share some of the lessons I learned along the way.

## Reliablity

As I was given ample time to complete this challenge, I wasn't searching for the fastest solution. Ensuring that all images would be touched and processed with a reliable outcome took a higher priority. So, I worked towards a solution that offered a good degree of robustness and kept things simple enough to set up and manage.

Taking a closer look at the challenge, processing an individual image could be broken apart in four distinct steps:

* Read a file from an NFS share mounted as a directory in read-only mode.
* Convert the image from the JPEG2000 to JPG format.
* Save as a temporary file at a scratch location on a local disk.
* Upload the file to an S3 bucket at a local S3 store within our infrastructure.

This is actually a [deterministic algorithm](https://en.wikipedia.org/wiki/Deterministic_algorithm). Running these steps multiple times with the same input always yields the same output. Concurrency and parallelism would allow me to run multiple conversions at the same time, reducing the time required to process the entire set of images.

I opted for an approach that uses the least number of moving parts and code to increase robustness and avoid having to dedicate too much time towards debugging secondary issues that aren't really related to the primary challenge. That translated into using a single machine and commonly available utility programs glued together with [Bash scripts](https://en.wikipedia.org/wiki/Bash_(Unix_shell)).

I acquired a VPS with 12 CPU cores and 48GB RAM through our ICT services which covered the hardware side of things. The high number of CPU cores allowed me to parallelize the workload into distinct jobs that ran concurrently. The entire set has a wide range of different pixel dimensions. The RAM sizing was chosen to cover the high end of the curve, as image data is loaded into memory during conversion. The machine was provisioned with [Alma Linux 9](https://almalinux.org/).

The software side consisted of just two shell scripts that glued the utilities together. 

* A `convert.sh` script accepted a CSV file with paths to files on the NFS share and some additional metadata. It would split the list in chunks and then process chunks concurrently with [GNU parallel](https://www.gnu.org/software/parallel/).

* A `process.sh` script that looped over each individual line in a chunk, fetching, converting and transferring image files to storage using [Imagemagick](https://imagemagick.org/) and [RClone](https://rclone.org/).

The output was sent to `stdout` as well as a dedicated, timestamped log-file allowing me to check for any errors after execution.

All I had to do was execute these scripts manually from the command line using [GNU Screen](https://en.wikipedia.org/wiki/GNU_Screen). This way, I could let the scripts run overnight as background processes on the machine, checking the log-files the next day. Monitoring consisted of simply logging into the machine from time to time and manually checking the output of the log-files.

Instead of processing the entire set of 430.000 images in one go, we created subsets based on material type - newspapers, manuscripts, photos,... - to continuously gauge the quality of the output, and ensure that all images were accounted for.

## Performance

ImageMagick is a widely used programming library in many programming languages and frameworks. It also provides a command line tool belt which allows direct manipulation of images. ImageMagick supports [JPG200 encoding and decoding](https://imagemagick.org/script/jp2.php) although that doesn't come readily out of the box. I ended up having to manual configure and install ImageMagick as well as the [OpenJPEG](https://github.com/uclouvain/openjpeg) library it depends upon, and [CMake](https://cmake.org/), a software build system necessary to compile the OpenJPEG code into a binary.

[VIPS](https://www.libvips.org/), an alternate image processing library, converts images much faster compared with ImageMagick. Moreover, libvips comes with JPEG2000 support out of the box. It's also easily installed on Alma Linux through [Remi's repository](https://rpms.remirepo.net/) on OS'es that are binary-compatible with [RHEL](https://en.wikipedia.org/wiki/Red_Hat_Enterprise_Linux).

I only learned about the existence of VIPS after completing this challenge. For this blogpost, I set some time apart to compare both tools in terms of performance.

I put 13 JP2 images with an average file size of 16.7M in a directory, then ran these commands each 3 times:

```bash
time find . -name "*jp2" | while read image; do awk '{ old=$0 ; new=old; sub(/\.jp2$/,".jpg", new) ; print old " ./output/" new }'; done | xargs -n 2 magick
time find . -name "*jp2" | while read image; do awk '{ old=$0 ; new=old; sub(/\.jp2$/,".jpg", new) ; print old " ./output/" new }'; done | xargs -n 2 vips copy
```

These are the results:

| Metric | ImageMagick (avg) | VIPS (avg) |
|--------|-------------------|------------|
| **real** | 58.094 s           | 8.041 s     |
| **user** | 56.376 s           | 42.129 s    |
| **sys**  | 1.721 s            | 3.715 s     |


Clearly, VIPS is a lot faster than ImageMagick. VIPS implementation makes several [architectural choices](https://github.com/libvips/libvips/wiki/Why-is-libvips-quick) that optimize the use of system resources like memory, processor caches and cores.

VIPS uses "horizontal threading" to process an image. Internally, VIPS makes use of [threading](https://en.wikipedia.org/wiki/Multithreading_(computer_architecture)). It creates threads per CPU core and provides a light-weight copy of the image pipeline to process. VIPS will orchestrates the execution of these pipelines to minimize the overall computation time to process the entire image. In this experiment, VIPS will use all 12 CPU cores to process a single image, while ImageMagick will just use 1 CPU core leaving the other cores idle. This explains the system clock time for VIPS being higher.

Even so, the overall processing of all images still happens sequentially. So, as a single VIPS process waits to complete, some threads associated with the process will finish sooner than others leaving individual CPU cores idle, waiting until the next VIPS process is started. This is where GNU parallel comes into play. This utility allows concurrent execution of multiple processes based on the number of CPU cores available. So, changing the command from this:

```bash
... xargs -n 2 vips copy
```

... to this ...

```bash
... parallel --memsuspend 20g -j 11 --lb --colsep ' ' vips copy {1} {2}
```

... allows for maximal utilization of all CPU cores. GNU Parallel acts like a workflow orchestrator, queuing batches of work to be picked up as soon as CPU cores become available. Individual VIPS processes can start and execute in an overlapping manner. Note that I keep one core free for other operations. I also suspend starting new processes if there's less then 20G free memory available. This ensures that jobs won't randomly fail because image data failed to load into memory. The `--lb` flag enables line-buffered output and load balancing, ensuring output is printed as soon as it is available, as well as an even distribution of jobs across all CPU cores.

To complete the comparison, I ran the experiment for both VIPS as well as ImageMagick:

```bash
time find . -name "*jp2" | while read image; do awk '{ old=$0 ; new=old; sub(/\.jp2$/,".jpg", new) ; print old " ./output/" new }'; done | parallel --memsuspend 20g -j 11 --lb --colsep ' ' vips copy {1} {2}
time find . -name "*jp2" | while read image; do awk '{ old=$0 ; new=old; sub(/\.jp2$/,".jpg", new) ; print old " ./output/" new }'; done | parallel --memsuspend 20g -j 11 --lb --colsep ' ' magick {1} {2}
```

And here are the results:

| Metric   | ImageMagick (avg) | VIPS (avg) |
|----------|-------------------|------------|
| **real** | 15.099 s           | 4.659 s     |
| **user** | 59.510 s           | 44.494 s    |
| **sys**  | 3.430 s            | 3.306 s     |

Note how using GNU parallel reduces the execution time of ImageMagick by 75% compared to 42% for VIPS. Since ImageMagick only uses a single CPU core to sequentially process all 13 images, parallelizing the execution yields a significant speed boost. Whereas VIPS already uses all the available CPU cores within a single process leaving less headroom for an increase in speed.

Nonetheless, VIPS beats ImageMagick in absolute terms when it comes to conversion speed. If I had to do this all over again, there is no contest and I would pick VIPS over ImageMagick. 

## Preserving quality

A key requirement was minimizing loss of quality or fidelity with respect to the original archival copy preserved as a TIFF file in the library's archive. The old system served the images via IIIF which allowed for the integration of a IIIF viewer in the library's catalog. The new solution features similar functionality, offering IIIF services.

The JPEG2000 format is well suited for fast generation and tiled delivery of images to IIIF viewers, promoting a smooth user experience when zooming into the details of a high resolution image. Since reducing storage usage is a requirement, it wasn't possible to migrate the images as-is.

The images are the result of many years of digitization efforts in the library. The original TIFF files are preserved on archival tape via the library's digital archiving system, and therefore not readily available. The JPEG2000 files were derived from the TIFF files before archival ingest. Applying lossless compression and preserving the original image size guaranteed that the experience offered through the old IIIF service kept the same fidelity as consuming the archival copies. Replicating a similar level of fidelity in the new system was and remains a key goal.

By contrast, the JPEG image format is based on lossy compression. Evaluating at which level perceived quality would degrade below an acceptable standard when applying compression, was an important step in the conversion process.

Measuring fidelity was approached as a subjective experience. A batch of 20 sample from various subsets based on material type - manuscripts, photographs,... - was picked and converted with ImageMagick using several settings. The end results were visually assessed by the team.

We settled on converting the images with the default settings for ImageMagick's `-quality` flag. For JPEG encoding [this means](https://imagemagick.org/script/command-line-options.php#quality):

> The default is to use the estimated quality of your input image if it can be determined, otherwise 92. When the quality is 90 or greater, then the chroma channels are not down-sampled. 

This yielded images that carried a sufficient level of perceived fidelity to the original, while at the same time had a compact enough file size. The table below shows the results from the 13 JP2 images I used as a benchmark. The first two columns show the file sizes in bytes, the last column shows the reduction per file. The average reduction is about 46.1%.

| JPEG2000 | JPEG.    | Reduction |
|----------|----------|-----------|
| 22009787 | 10318086 | 46.9%     |
| 54454786 | 21500926 | 39.5%.    |
| 64025710 | 27389947 | 42.8%.    |
| 3968113  | 1857565  | 46.8%.    |
| 2833409  | 1343368  | 47.4%.    |
| 3742612  | 1761376  | 47.0%.    |
| 3526914  | 1678123  | 47.6%.    |
| 2939523  | 1360096  | 46.3%.    |
| 3697866  | 1764706  | 47.7%.    |
| 2513900  | 1284229  | 51.1%.    |
| 21639794 | 11045181 | 51.0%.    |
| 23127738 | 11986355 | 51.8%.    |
| 10217749 | 3458429  | 33.8%.    |

Moreover, the quality reported by [ExifTool](https://exiftool.org/) using the `exiftool -JPEGQualityEstimate` command for all JPG images results in the value "92", which reflects the configured quality level when the images were generated by ImageMagick. [FotoForensics](https://fotoforensics.com/) confirms this value.

Tangentially, the [ImageMagick suite doesn't necessarily yield an exact JPEG quality estimation](https://bitsgalore.org/2024/10/23/jpeg-quality-estimation-experiments-with-a-modified-imagemagick-heuristic.html). It's use of "92" as a fallback value, if it cannot come up with estimate, makes it impossible to differentiate between images that have a true 92% value and those for which this value cannot be established. This becomes problematic when trying to assert the quality of images that weren't generated with ImageMagick. 

The output using the default settings received a positive appraisal by the team. Minimal compression yielded a great result, and the reduction in file size would leave plenty of free storage relative to the storage limits in the new system for future growth of the image library in years to come.

## Storing the converted output

The JPG files were stored on a scratch location on the local filesystem of the VPS as a temporary file. Given the total volume of all files, it wasn't possible to keep everything on the local filesystem. Neither was this an option in terms of data safety. A local S3 storage became our primary store. All images were uploaded to a single bucket.

At this point, I need to clarify how files are stored in the old image library system. Images are grouped into representations of physical items. An item can be digitally represented as one or multiple images capturing different aspects. A newspaper consists of multiple pages, a small statue consists of multiple sides. Representations are identified via an UUID. The JPEG2000 files are stored on NFS shares grouped in a directory per representation.

The system delivers a CSV export file containing paths to the files, the UUID, item barcode, the identifier of the associated bibliographic record, and the original filename of the TIFF file. This export file serves as a base input for the entire conversion pipeline. 

This set can be broken down into different material types reflecting the analogue source materials present in the library's heritage collections: ephemera, photographs, plans, books, manuscripts,... Splitting the export file into batches per type allowed the team to independently review the quality of each batch.

As a result, the S3 objects where logically labeled as directories and files. At the top level, representations were grouped per material type, and files were grouped per representation using the UUID as a directory name.

```
/manuscripts/830241A2-A979-4C59-8A15-9EF5B973EB92
/manuscripts/40F3335D-C917-42E9-AA5D-5CA072864015
/manuscripts/7A1A3EEC-E381-4800-B390-0220CE79AEAC
...
/ephemera/5838D2F4-4F40-4213-8E37-529F000E3753
/ephemera/8104B8F9-C3AA-4D9C-9090-C0664BA48F1D
...
```

As images are converted, they were immediately copied with [RClone](https://rclone.org/) to the S3 storage and then removed from the local scratch store.

```bash
# $BATCH = batchname
# $TMDIR = scratch location
# $TGT, $SRC = filenames of the image
rclone copy --s3-no-check-bucket --links --metadata "$TMPDIR/$SRC" "s3-endpoint:bucket/$BATCH/$TGT"
```

## Putting it all together

Starting from a CSV export file of the entire image set, we split the dataset into separate CSV files per material type. Each file is separately processed and manually verified.

Since these files can hold tens of thousands of rows referencing to images, we split them further in chunks of 50 lines which are then processed in parallel.

This is a an abridged version of `convert.sh`:

```bash
#!/usr/bin/env bash

TMPDIR="/opt/migration/tmp"
BATCH=$2

# 1. Split the file into chunks of 50 lines

cd $TMPDIR
split -l 50 $1 img_part_

# 3. Process an individual chunk of 50 lines
process_chunk() {
    chunk=$1
    batch=$2

    # Process the chunkfile
    "/opt/migration/bin/process.sh" $chunkfile $batch

    # Delete the chunkfile
    rm $chunk
}
export -f process_chunk

# 2. Find all chunks and pass them to GNU parallel which calls the process_chunk function with args
#    and distributes them across the 11 available CPU cores.
find "$CHUNKDIR" -name "img_part_*" | parallel --memsuspend 20g -j 11 --lb process_chunk {} $BATCH
```

This is a abridged verison of `process.sh`:

```bash
#!/usr/bin/env bash

BATCH=$3
DIRDATE=`date +%Y%m%d`

TMPDIR="/opt/migration/tmp"
LOG="/opt/migration/logs/convert.$BATCH.$DIRDATE.log"

# loop over all lines in the chunkfile
cat $1 | while read image
do
    # Representation UUID
    UUID=$( echo $image | cut -f1 -d"," )
    # Bibliographic record ID
    RECID=$( echo $image | cut -f3 -d"," | 
    # Path to source file
    SRC=$( echo $image | cut -f6 -d"," )
    # Filename of the destination file
    # Note: we rename the files to the original TIFF file with the ".jpg" extension
    #   "uuid-page-2.jp2" becomes "original-tiff-name.jpg"
    TGT=$( echo $image | cut -f4 -d"," | sed -e 's/ti[f]*/jpg/g' )        

    # Create a scratch dir per representation to avoid collisions, we can't guarantee that
    # original-tiff-name is unique as these come from multiple sources and origins.
    SCRATCHDIR="$TMPDIR/$UUID"
    if [ ! -d $LOCALDIR ];then
        info ".. creating $LOCALDIR"
        mkdir -p $LOCALDIR
    fi

    # Convert the JPEG2000 image to JPG and store in scratch dir.
    # Swapping this out for VIPS would make conversion even faster as it would make use of horizontal threading
    magick $SRC "$LOCALDIR/$TGT"

    if [ $? -ne 0 ]; then
        echo "$(date +"%Y/%m/%d %H:%M:%S") ERROR [$$] : $RECID : Failed to convert $SRC to $TGT" >> "$LOG"
        continue
    fi

    echo "$(date +"%Y/%m/%d %H:%M:%S") INFO [$$] : Converted $SRC to $TGT" >> "$LOG"

    # Transfer the individual JPG file to the S3 endpoint to the correct $BATCH/$UUID directory
    rclone copy --s3-no-check-bucket --links --metadata "$LOCALDIR/$TGT" "s3-endpoint:bucket/$BATCH/$UUID"
    
    if [ $? -ne 0 ]; then
        echo "$(date +"%Y/%m/%d %H:%M:%S") ERROR [$$] : $RECID : Failed to copy $TGT to S3" >> "$LOG"
        continue
    fi
    
    echo "$(date +"%Y/%m/%d %H:%M:%S") INFO [$$] : $RECID : Copied $TGT to S3" >> "$LOG"

    # Remove the JPG file from the scratch location
    rm "$LOCALDIR/$TGT"
done
```

This approach generates a lot of empty `$SCRATCHDIR` directories as a side effect, one per representation. Splitting out the batch CSV file into chunks of 50 lines potentially leads to splitting files associated with a representation across multiple chunks. Parallel processing makes it impossible to determine when a representation is fully processed. Registering all the rows in the batch CSV file in a ledger (an SQLite database), which is than used to determine if all files within a representation were converted, would make it possible to remove empty directories during execution of the scripts.

I opted out of this strategy because it would just add complexity and impact processing performance. Since the virtual machine uses the [XFS filesystem](https://en.wikipedia.org/wiki/XFS), I didn't have to account for a hard limit on the number of subdirectories which could be created. Cleaning up post execution of the scripts was as simple as running this command:

```bash
find . -type d -empty -delete
```

Additionally, the inability to determine when all images of a representation had been processed also meant that I wasn't able to make use of RClone's support for [parallel copying](https://rclone.org/docs/#transfers-int). This snippet would copy the entire contents of the representation directory using running multiple file transfers in parallel:

```bash
if [ $completed ];then
    rclone copy --s3-no-check-bucket --links --metadata "$LOCALDIR" "s3-endpoint:bucket/$BATCH/$UUID"
fi
```

However, this wouldn't have yielded a noticeable net gain in speed because RClone is already executed within a parallelized context via GNU parallel.

I ran these scripts in the background on the machine using a separate [GNU Screen](https://en.wikipedia.org/wiki/GNU_Screen) login session in a virtual console. The `screen` command allowed me to detach from the console, and log off. Processing just kept on running, sometimes overnight, while I could focus on other things. Beyond the log-file, there was no feedback i.e. when processing had completed or had failed. I had to perform several manual checks throughout the day.

## Conclusion

I converted 430.057 images, with some 477 failures. That's a failure rate of 0.11%! All of them are images with oversized pixel dimensions which simply wouldn't fit in memory during the execution. These need to be processed separately.

The total size of the converted set of images weighs in at 2.93 TB which meets the storage requirements. The source set of JPEG2000 files consists of about 7.23 TB of data. A reduction of about 59.5% in volume was achieved.

Completing the entire conversion happened across several weeks. During that time, I switched between running and re-running  conversions, tweaking the scripts where applicable, as well as attending other aspects of the project such as creating a robust workflow for uploading and importing the images with the appropriate metadata. For reference, I was able to process a batch of 95.558 images in 23 hours, with 35 failures.


[//]: # non parallel
[//]: # 3 runs with imagemagick:

[//]: # real    0m15.049s
[//]: # user    0m59.425s
[//]: # sys     0m3.378s

[//]: # real    0m15.132s
[//]: # user    0m59.619s
[//]: # sys     0m3.520s

[//]: # real    0m15.116s
[//]: # user    0m59.486s
[//]: # sys     0m3.392s

[//]: # 3 runs with vips:

[//]: # real    0m4.691s
[//]: # user    0m44.575s
[//]: # sys     0m3.370s

[//]: # real    0m4.647s
[//]: # user    0m44.384s
[//]: # sys     0m3.287s

[//]: # real    0m4.640s
[//]: # user    0m44.523s
[//]: # sys     0m3.261s

[//]: # parallel
[//]: # 12 images
[//]: # 3 runs with imagemagick:

[//]: # real    0m58.093s
[//]: # user    0m56.363s
[//]: # sys     0m1.730s

[//]: # real    0m58.089s
[//]: # user    0m56.385s
[//]: # sys     0m1.705s

[//]: # real    0m58.101s
[//]: # user    0m56.379s
[//]: # sys     0m1.729s

[//]: # 3 runs with vips:

[//]: # real    0m8.020s
[//]: # user    0m41.944s
[//]: # sys     0m3.852s

[//]: # real    0m8.068s
[//]: # user    0m42.319s
[//]: # sys     0m3.656s

[//]: # real    0m8.036s
[//]: # user    0m42.125s
[//]: # sys     0m3.638s