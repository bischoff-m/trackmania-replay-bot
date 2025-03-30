import itertools
import json
from typing import Dict, List, Sequence, Set, Tuple

import cv2 as cv
import numpy as np
from IPython.display import display
from sklearn.cluster import MeanShift


def locate_template(
    image: np.ndarray, template: np.ndarray, verbose=False
) -> List[Tuple[int, int]]:
    base_img = image
    needle_img = template

    ############################################################################
    # Run SIFT on both images to find keypoints and descriptors
    ############################################################################
    sift: cv.SIFT = cv.SIFT_create()
    all_kp_base, des_base = sift.detectAndCompute(base_img, None)
    all_kp_needle, des_needle = sift.detectAndCompute(needle_img, None)
    print(f"Found {len(all_kp_base)} keypoints in base image.")
    print(f"Found {len(all_kp_needle)} keypoints in needle image.")

    bf_matcher = cv.BFMatcher()
    all_matches = bf_matcher.knnMatch(des_base, des_needle, k=2)

    # TODO: Check that there is exactly one match for each base keypoint

    # good_matches = []
    kp_base_set: Set[int] = set()
    kp_needle_set: Set[int] = set()
    base_to_needle: Dict[int, int] = dict()
    needle_to_bases: Dict[int, Set[int]] = dict()
    for m, n in all_matches:
        # Apply ratio test
        if m.distance >= 0.75 * n.distance:
            continue

        # Calculate difference in angle
        base_angle = all_kp_base[m.queryIdx].angle
        needle_angle = all_kp_needle[m.trainIdx].angle
        angle_diff = (base_angle - needle_angle) % 360
        if angle_diff > 180 or angle_diff < -180:
            angle_diff = 360 - angle_diff

        # Check if angle is similar
        if angle_diff > 10:
            continue

        # good_matches.append(m)
        kp_base_set.add(m.queryIdx)
        kp_needle_set.add(m.trainIdx)
        base_to_needle[m.queryIdx] = m.trainIdx
        needle_to_bases.setdefault(m.trainIdx, set()).add(m.queryIdx)

    kp_base = np.array(list(kp_base_set))
    kp_needle = np.array(list(kp_needle_set))

    # Calculate the angle between all needle keypoints and the center
    angles_needle = np.full(len(all_kp_needle), np.nan)
    for kp in kp_needle:
        angles_needle[kp] = np.arctan2(
            all_kp_needle[kp].pt[1] - needle_img.shape[0] / 2,
            all_kp_needle[kp].pt[0] - needle_img.shape[1] / 2,
        )

    # Calculate all lines in base image
    lines = np.full((len(all_kp_base), 3), np.nan)
    for kp in kp_base:
        angle_base = angles_needle[base_to_needle[kp]]
        # Calculate A*x + B*y = C
        A = np.sin(angle_base)
        B = -np.cos(angle_base)
        C = A * all_kp_base[kp].pt[0] + B * all_kp_base[kp].pt[1]
        lines[kp] = [A, B, C]

    # TODO
    # Define M = len(all_kp_base) x len(all_kp_base) matrix
    # For every pair of keypoints i, j
    #   M[i, j] = Scale of needle image if the intersection of the lines of i and j
    #             is the center of the needle image (viewed from i)

    # Calculate all intersection points between lines in base image
    # TODO: Do not calculate intersections twice
    intersections = np.full((len(all_kp_base), len(all_kp_base), 2), np.nan)
    for kp1 in kp_base:
        for kp2 in kp_base:
            if kp1 == kp2:
                continue
            A1, B1, C1 = lines[kp1]
            A2, B2, C2 = lines[kp2]
            det = A1 * B2 - A2 * B1
            if det == 0:
                continue
            x = (B2 * C1 - B1 * C2) / det
            y = (A1 * C2 - A2 * C1) / det
            intersections[kp1, kp2] = [x, y]

    # Draw intersections
    img = cv.cvtColor(base_img, cv.COLOR_GRAY2RGB)
    for kp1 in kp_base:
        for kp2 in kp_base:
            if kp1 == kp2:
                continue
            x, y = intersections[kp1, kp2]
            if np.isnan(x) or np.isnan(y) or np.isinf(x) or np.isinf(y):
                continue
            cv.circle(img, (int(x), int(y)), 1, (0, 0, 255), 1, cv.LINE_AA)

    # cv.imshow("Result", img)
    # cv.waitKey()
    # cv.destroyAllWindows()

    return []


def locate_template_structure(
    image: np.ndarray, template: np.ndarray, verbose=False
) -> List[Tuple[int, int]]:
    """Find matches using SIFT and ...

    - Robust to changes in translation and scale
    - Does not match rotated or skewed images

    Algorithm:
    ----------
    1. Find and match keypoints in both images
    2. Filter out keypoints
    3. Cluster keypoints based on their representation of the structure of the
       template image
        1. Start with a random keypoint in the base image ("root keypoint")
        2. For every "y": Select a keypoint in the base image based on the angle
           between "x" and "y"
            - Let x be the needle keypoint that matches the root keypoint
            - Let y be a keypoint in the needle image
        3. Compute the ratio between the distance of "x" and "y" and the
           distance of the corresponding base keypoints
            - This estimates the scale of the needle image
        4. Add all base keypoints that have a very similar ratio to the cluster

    New Idea:
    ---------
    - Have a set with all keypoints that still need labeling
    - Sample keypoint in the base image
    - Get cluster and scale using the angle rule
        (Need to define acceptance criterium here, e.g. 50% of keypoints agree)
    - Approximate center using all points in the cluster and the scale
    - Add all keypoints that yield the same center with the given scale
    - Remove them from the set and increase the cluster index
    """

    base_img = image
    needle_img = template

    ############################################################################
    # Run SIFT on both images to find keypoints and descriptors
    ############################################################################
    sift: cv.SIFT = cv.SIFT_create()
    all_kp_base, des_base = sift.detectAndCompute(base_img, None)
    all_kp_needle, des_needle = sift.detectAndCompute(needle_img, None)
    print(f"Found {len(all_kp_base)} keypoints in base image.")
    print(f"Found {len(all_kp_needle)} keypoints in needle image.")

    bf_matcher = cv.BFMatcher()
    all_matches = bf_matcher.knnMatch(des_base, des_needle, k=2)

    # TODO: Check that there is exactly one match for each base keypoint

    # good_matches = []
    kp_base_set: Set[int] = set()
    kp_needle_set: Set[int] = set()
    base_to_needle: Dict[int, int] = dict()
    needle_to_bases: Dict[int, Set[int]] = dict()
    for m, n in all_matches:
        # Apply ratio test
        if m.distance >= 0.75 * n.distance:
            continue

        # Calculate difference in angle
        base_angle = all_kp_base[m.queryIdx].angle
        needle_angle = all_kp_needle[m.trainIdx].angle
        angle_diff = (base_angle - needle_angle) % 360
        if angle_diff > 180 or angle_diff < -180:
            angle_diff = 360 - angle_diff

        # Check if angle is similar
        if angle_diff > 10:
            continue

        # good_matches.append(m)
        kp_base_set.add(m.queryIdx)
        kp_needle_set.add(m.trainIdx)
        base_to_needle[m.queryIdx] = m.trainIdx
        needle_to_bases.setdefault(m.trainIdx, set()).add(m.queryIdx)

    kp_base = np.array(list(kp_base_set))
    kp_needle = np.array(list(kp_needle_set))

    ############################################################################
    # Calculate the angle between all needle keypoints
    ############################################################################
    angles_needle = np.full((len(all_kp_needle), len(all_kp_needle)), np.nan)
    for kp1_idx in kp_needle:
        kp1_pos = all_kp_needle[kp1_idx].pt
        for kp2_idx in kp_needle:
            kp2_pos = all_kp_needle[kp2_idx].pt
            angles_needle[kp1_idx, kp2_idx] = np.arctan2(
                kp2_pos[1] - kp1_pos[1], kp2_pos[0] - kp1_pos[0]
            )

    ############################################################################
    # Calculate all lines in base image
    ############################################################################
    lines = np.full((len(all_kp_base), 3), np.nan)
    for kp in kp_base:
        angle_base = angles_needle[base_to_needle[kp]]
        # Calculate A*x + B*y = C
        A = np.sin(angle_base)
        B = -np.cos(angle_base)
        C = A * all_kp_base[kp].pt[0] + B * all_kp_base[kp].pt[1]
        lines[kp] = [A, B, C]

    ############################################################################
    ############################################################################
    # This holds the index of the cluster that each base keypoint belongs to
    clusters = np.full(len(all_kp_base), np.nan)

    keypoint_queue = kp_base_set.copy()
    cluster_idx = 0
    while len(keypoint_queue) > 0:
        # Get keypoint from queue
        # We will try to assign this keypoint to a cluster
        root_base = keypoint_queue.pop()
        root_pos = all_kp_base[root_base].pt
        # Skip if already assigned to a cluster
        # if not np.isnan(clusters[root_base]):
        #     continue

        # Index of the needle keypoint that matches the root keypoint
        root_needle = base_to_needle[root_base]

        # Angle between root base keypoint and all other base keypoints
        angles_base = np.full(len(all_kp_base), np.nan)
        for other_base in kp_base:
            other_pos = all_kp_base[other_base].pt
            angles_base[other_base] = np.arctan2(
                other_pos[1] - root_pos[1], other_pos[0] - root_pos[0]
            )

        # Get base keypoints that match the angle between the root needle
        # keypoint and all other needle keypoints the best
        # And calculate the ratio of distance: [(base_idx, ratio)]
        angle_threshold = np.pi / 18  # 10 degrees
        best_fit = np.full((len(kp_needle), 3), np.nan)
        for idx, other_needle in enumerate(kp_needle):
            angle_needle = angles_needle[root_needle, other_needle]
            others_base = np.array(list(needle_to_bases[other_needle]))
            # Find the base keypoint that matches the angle the best
            # TODO: Only consider keypoints that match within a certain threshold
            within_threshold = others_base[
                np.abs(angles_base[others_base] - angle_needle) < angle_threshold
            ]
            if len(within_threshold) == 0:
                continue
            best_base = min(
                within_threshold,
                key=lambda x: abs(angles_base[x] - angle_needle),
            )
            diff_base = np.array(all_kp_base[best_base].pt) - np.array(
                all_kp_base[root_base].pt
            )
            diff_needle = np.array(all_kp_needle[other_needle].pt) - np.array(
                all_kp_needle[root_needle].pt
            )
            ratio = (
                np.linalg.norm(diff_base) / np.linalg.norm(diff_needle)
                if diff_needle.any()
                else np.nan
            )
            best_fit[idx] = [other_needle, best_base, ratio]

        best_fit = best_fit[~np.isnan(best_fit).any(axis=1)]
        if len(best_fit) < max(4, len(kp_needle) // 3):
            # Reject this keypoint because there are not enough matches to be
            # confident enough. It may be assigned to a cluster later or is
            # regarded as an outlier otherwise
            continue
        ratios = best_fit[:, 2]

        # Filter out keypoints that likely do not belong to the same cluster
        # because their ratio is too far off
        ratios_sorted = ratios.copy()
        ratios_sorted.sort()
        threshold = 0.2
        accept_start = len(ratios) // 2
        accept_end = accept_start
        mean_approx = ratios_sorted[accept_start]
        # Expand left and right alternatingly
        expand_left = True
        expand_right = True
        while expand_left or expand_right:
            if expand_left:
                if accept_start == 0:
                    expand_left = False
                elif ratios_sorted[accept_start - 1] >= mean_approx * (1 - threshold):
                    accept_start -= 1
                else:
                    expand_left = False
            if expand_right:
                if accept_end == len(ratios) - 1:
                    expand_right = False
                elif ratios_sorted[accept_end + 1] <= mean_approx * (1 + threshold):
                    accept_end += 1
                else:
                    expand_right = False
            mean_approx = (ratios_sorted[accept_start] + ratios_sorted[accept_end]) / 2

        cluster = best_fit[
            (ratios >= ratios_sorted[accept_start])
            & (ratios <= ratios_sorted[accept_end])
        ]
        cluster_indices = cluster[:, 1].astype(int)
        if len(cluster) / len(best_fit) < 0.5:
            # Not enough keypoints agree on the scale
            continue
        # a = len(best_fit)
        # b = len(cluster)
        # for v in sorted(ratios):
        #     if v in cluster:
        #         print(f"{v:.3f}", end="\t")
        #     else:
        #         print(f"!{v:.3f}", end="\t")
        # # for v in
        # print(f"\nFound {b} matches out of {a} -> {b/a*100:.2f}%")
        # if b / a < 0.5:
        #     for nidx, bidx, scale in best_fit:
        #         print(
        #             f'[{"*" if bidx in cluster else " "}] {int(bidx)} -> {int(nidx)} ({scale:.5f})'
        #         )

        ########################################################################
        ########################################################################
        scale = np.mean(cluster[:, 2])

        # Get the center of the cluster at that scale
        cluster_lines = lines[cluster_indices]

    # # Draw clusters
    # img = cv.cvtColor(base_img, cv.COLOR_GRAY2RGB)
    # print(np.unique(clusters))
    # for cluster_idx in np.unique(clusters):
    #     if np.isnan(cluster_idx):
    #         continue
    #     cluster = np.where(clusters == cluster_idx)[0]
    #     random_color = np.random.randint(0, 255, 3).tolist()
    #     for base_idx in cluster:
    #         cv.drawMarker(
    #             img,
    #             np.int32(all_kp_base[base_idx].pt),
    #             random_color,
    #             cv.MARKER_TILTED_CROSS,
    #             10,
    #             2,
    #         )

    # cv.imshow("Result", img)
    # cv.waitKey()
    # cv.destroyAllWindows()

    return []


def locate_template_clustering(
    image: np.ndarray, template: np.ndarray, verbose=False
) -> List[Tuple[int, int]]:
    """Find matches using SIFT and MeanShift clustering."""

    base_img = image
    needle_img = template
    h, w = needle_img.shape

    ############################################################################
    # Run SIFT on both images to find keypoints and descriptors
    ############################################################################
    sift: cv.SIFT = cv.SIFT_create()
    kp_base, des_base = sift.detectAndCompute(base_img, None)
    kp_needle, des_needle = sift.detectAndCompute(needle_img, None)
    print(f"Found {len(kp_base)} keypoints in base image.")
    print(f"Found {len(kp_needle)} keypoints in needle image.")

    bf = cv.BFMatcher()
    matches = bf.knnMatch(des_base, des_needle, k=2)

    # TODO: Check that there is exactly one match for each base keypoint

    good_matches = []
    good_base_kp = set()
    good_needle_kp = set()
    base_to_needle = {}
    matches_map = {}
    for m, n in matches:
        # Apply ratio test
        if m.distance >= 0.75 * n.distance:
            continue

        # Check if angle is similar
        base_angle = kp_base[m.queryIdx].angle
        needle_angle = kp_needle[m.trainIdx].angle
        # Normalize rotation
        angle_diff = (base_angle - needle_angle) % 360
        if angle_diff > 180 or angle_diff < -180:
            angle_diff = 360 - angle_diff

        if angle_diff > 10:
            continue

        good_matches.append(m)
        good_base_kp.add(m.queryIdx)
        good_needle_kp.add(m.trainIdx)
        base_to_needle[m.queryIdx] = m.trainIdx
        matches_map.setdefault(m.trainIdx, set()).add(m.queryIdx)

    print(f"Found {len(good_base_kp)} matching keypoints in base image.")
    print(f"Found {len(good_needle_kp)} matching keypoints in needle image.")

    # for base_idx in good_base_kp:
    #     angles = {}
    #     needle_match = base_to_needle[base_idx]
    #     npos = kp_needle[needle_match].pt
    #     for needle_idx in good_needle_kp:
    #         # if needle_idx == needle_match:
    #         #     continue
    #         npos_new = kp_needle[needle_idx].pt
    #         angle = np.arctan2(npos_new[1] - npos[1], npos_new[0] - npos[0])
    #         angles[needle_idx] = angle

    #     best_fit_idx = {}
    #     best_fit_dist = {}
    #     bpos = kp_base[base_idx].pt
    #     for needle_idx in angles:
    #         base_matches = matches_map[needle_idx]
    #         match_angles = {}
    #         for base_match in base_matches:
    #             bpos_new = kp_base[base_match].pt
    #             angle = np.arctan2(bpos_new[1] - bpos[1], bpos_new[0] - bpos[0])
    #             match_angles[base_match] = angle
    #         # print(json.dumps(match_angles, indent=2))

    #         needle_angle = angles[needle_idx]
    #         choice = min(
    #             match_angles, key=lambda x: abs(match_angles[x] - needle_angle)
    #         )
    #         best_fit_idx[needle_idx] = choice
    #         # Calc (distance between points in base) / (distance between points in needle)
    #         diff_base = np.array(kp_base[choice].pt) - np.array(bpos)
    #         diff_needle = np.array(kp_needle[needle_idx].pt) - np.array(npos)
    #         norm_needle = np.linalg.norm(diff_needle)
    #         if norm_needle == 0:
    #             continue
    #         dist = np.linalg.norm(diff_base) / norm_needle
    #         # Check NaN
    #         if dist != dist:
    #             continue
    #         best_fit_dist[choice] = dist
    #     print(json.dumps(best_fit_dist, indent=2))

    #     values = np.array(list(best_fit_dist.values()))
    #     deviation = np.abs(values - np.median(values))
    #     median_dev = np.median(deviation)
    #     norm_dev = deviation / median_dev if median_dev else np.zeros(len(deviation))
    #     threshold = 2
    #     result = np.array(list(best_fit_dist.keys()))[norm_dev < threshold]
    #     display(result)

    #     # Visualize best fit on base image
    #     img = cv.cvtColor(base_img, cv.COLOR_GRAY2RGB)
    #     for base_sub_idx in result:
    #         random_color = np.random.randint(0, 255, 3).tolist()
    #         img = cv.drawKeypoints(
    #             img, [kp_base[base_sub_idx]], None, color=random_color
    #         )
    #     cv.drawMarker(img, np.int32(bpos), (0, 0, 255), cv.MARKER_TILTED_CROSS, 10, 2)

    #     cv.imshow("Result2", img)
    #     cv.waitKey()
    #     cv.destroyAllWindows()

    #     # print(json.dumps(angles, indent=2))
    #     break

    # return []
    # Iterate all keypoints of good matches in base image
    # For all keypoints in needle image that have a good match in base image
    #   Check if the keypoints in needle image are positioned compared to the
    #   keypoints in base image

    # ms = MeanShift(bandwidth=50)
    # ms.fit(np.float32([kp_base[m.queryIdx].pt for m in good_matches]))
    # groups = itertools.groupby(zip(ms.labels_, good_matches), lambda x: x[0])
    # clusters = [list(map(lambda m: m[1], g)) for k, g in groups]

    # verbose and print(f"Found {len(clusters)} clusters.")
    # verbose and print(f"Cluster sizes: {[len(c) for c in clusters]}")

    # img1 = cv.cvtColor(base_img, cv.COLOR_GRAY2RGB)
    # img2 = cv.cvtColor(needle_img, cv.COLOR_GRAY2RGB)
    # # img = cv.drawKeypoints(img, [kp_base[m.queryIdx] for m in good_matches], None)

    # for cluster in clusters:
    #     for m in cluster:
    #         a: cv.DMatch = m
    #         random_color = np.random.randint(0, 255, 3).tolist()
    #         img1 = cv.drawKeypoints(
    #             img1, [kp_base[m.queryIdx]], None, color=random_color
    #         )
    #         img2 = cv.drawKeypoints(
    #             img2, [kp_needle[m.trainIdx]], None, color=random_color
    #         )
    #     # img = cv.drawMatches(
    #     #     img,
    #     #     kp_base,
    #     #     needle_img,
    #     #     kp_needle,
    #     #     cluster,
    #     #     None,
    #     #     flags=cv.DrawMatchesFlags_DEFAULT,
    #     # )
    #     break

    # # cv.imshow("Result1", img1)
    # # cv.imshow("Result2", img2)
    # # cv.waitKey()
    # # cv.destroyAllWindows()

    # return []

    ############################################################################
    # Match descriptors and filter out bad matches
    ############################################################################
    bf = cv.BFMatcher()
    matches = bf.match(des_base, des_needle)

    good_matches = []
    for m in matches:
        base_angle = kp_base[m.queryIdx].angle
        needle_angle = kp_needle[m.trainIdx].angle
        # Normalize rotation
        angle_diff = (base_angle - needle_angle) % 360
        if angle_diff > 180 or angle_diff < -180:
            angle_diff = 360 - angle_diff

        if angle_diff > 60:
            continue
        if m.distance > 100:
            continue
        good_matches.append(m)

    if len(good_matches) == 0:
        verbose and print("No matches found")
        return []
    else:
        verbose and print(f"Found {len(good_matches)} valid matches.")

    ############################################################################
    # Group matches using MeanShift
    ############################################################################
    img = cv.cvtColor(base_img, cv.COLOR_GRAY2RGB)

    ms = MeanShift(bandwidth=50)
    ms.fit(np.float32([kp_base[m.queryIdx].pt for m in good_matches]))
    groups = itertools.groupby(zip(ms.labels_, good_matches), lambda x: x[0])
    clusters = [list(map(lambda m: m[1], g)) for k, g in groups]

    verbose and print(f"Found {len(clusters)} clusters.")
    verbose and print(f"Cluster sizes: {[len(c) for c in clusters]}")

    ############################################################################
    # Calculate center of each cluster and draw bounding box
    ############################################################################
    def get_bounding_box(cluster: Sequence[cv.DMatch]) -> Tuple[int, int, int, int]:
        def return_estimate():
            mean = np.mean([kp_base[m.queryIdx].pt for m in cluster], axis=0)
            rectangle = np.int32([mean[0] - w / 2, mean[1] - h / 2, w, h])
            return rectangle

        if len(cluster) < 4:
            return return_estimate()

        transform, _ = cv.findHomography(
            np.float32([kp_needle[m.trainIdx].pt for m in cluster]),
            np.float32([kp_base[m.queryIdx].pt for m in cluster]),
            cv.RANSAC,
        )

        # Sort by similarity to image
        # match_sorted = sorted(cluster, key=lambda m: m.distance)[-3:]
        # print([m.distance for m in match_sorted])
        # transform = cv.getAffineTransform(
        #     np.float32([kp_needle[m.trainIdx].pt for m in match_sorted]),
        #     np.float32([kp_base[m.queryIdx].pt for m in match_sorted]),
        # )

        if transform is None:
            return return_estimate()
        print(transform)

        # Get bounding box
        corners = np.float32([[0, 0], [0, h], [w, h], [w, 0]]).reshape(-1, 1, 2)
        dst = cv.transform(corners, transform)
        dst = np.array([[x, y] for [[x, y, _]] in dst])
        # Drop last dimension
        # dst = dst.reshape(-1, 2)
        # dst = cv.perspectiveTransform(corners, transform)
        # print("before", dst)
        # dst = np.array([[d] for d in dst.reshape(-1, 1)])
        print("dst", dst)

        # Match rectangle (possibly rotated)
        rect = cv.minAreaRect(dst)
        # Create RotatedRect from rectangle and get bounding box
        box = cv.RotatedRect(*rect).boundingRect()
        return box

    # Draw bounding boxes and center points
    centers = []
    for cluster in clusters:
        box = get_bounding_box(cluster)
        box_center = [box[0] + box[2] / 2, box[1] + box[3] / 2]
        centers.append(box_center)

        if verbose:
            random_color = np.random.randint(0, 255, 3).tolist()
            # cv.drawMatches(
            #     img,
            #     kp_base,
            #     needle_img,
            #     kp_needle,
            #     cluster,
            #     None,
            #     matchColor=random_color,
            #     singlePointColor=random_color,
            #     flags=cv.DrawMatchesFlags_DEFAULT,
            # )
            # cv.imshow("Result", img)
            # cv.waitKey()
            # cv.destroyAllWindows()

            for m in cluster:
                x, y = kp_base[m.queryIdx].pt
                cv.circle(img, (int(x), int(y)), 3, random_color, 2, cv.LINE_AA)
                cv.drawMarker(img, (int(x), int(y)), (0, 255, 0), cv.MARKER_CROSS, 10)

            cv.rectangle(img, box, random_color, 1, cv.LINE_AA)
            cv.drawMarker(
                img, np.int32(box_center), (0, 0, 255), cv.MARKER_TILTED_CROSS, 10, 2
            )

    # Searching in 1 Match 1440p
    # Max similarity value: 0.935211718082428
    # Max location: (348, 402)
    # Found 41 matches without grouping.
    # Found 1 matches.
    # Rectangles: [[348 402  58  65]]
    # Rectangle weights: [82]

    # X: 380
    # Y: 420
    if verbose:
        cv.imshow("Result", img)
        cv.waitKey()
        cv.destroyAllWindows()

    return centers
